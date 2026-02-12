using System.Net;
using System.Security.Claims;
using BlitzTask.Infrastructure.Data;
using BlitzTask.Infrastructure.Filters;
using BlitzTask.Infrastructure.Models;
using BlitzTask.Infrastructure.Notifications;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlitzTask.Features.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var authGroup = app.MapGroup("/api").WithTags("Authentication");

        authGroup
            .MapPost("/login", Login)
            .WithName("login")
            .AddEndpointFilter<ValidationFilter<LoginRequest>>()
            .Produces<CurrentUser>()
            .Produces<ApiMessageResponse>(StatusCodes.Status401Unauthorized)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status422UnprocessableEntity);

        authGroup.MapPost("/logout", (Delegate)Logout).WithName("logout");

        authGroup
            .MapGet("/me", GetCurrentUser)
            .WithName("get-current-user")
            .RequireAuthorization()
            .Produces(StatusCodes.Status401Unauthorized);

        authGroup
            .MapPost("/create-account", CreateAccount)
            .WithName("create-account")
            .AddEndpointFilter<ValidationFilter<CreateUserRequest>>()
            .Produces<CurrentUser>()
            .Produces<ApiMessageResponse>(StatusCodes.Status400BadRequest)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status422UnprocessableEntity);

        authGroup
            .MapPost("/confirm-email", ConfirmEmail)
            .WithName("confirm-email")
            .AddEndpointFilter<ValidationFilter<ConfirmEmailRequest>>()
            .Produces<ApiMessageResponse>(StatusCodes.Status200OK)
            .Produces<ApiMessageResponse>(StatusCodes.Status400BadRequest)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status422UnprocessableEntity);

        authGroup
            .MapPost("/resend-confirm-email", ResendConfirmEmail)
            .WithName("resend-confirm-email")
            .RequireAuthorization();

        return app;
    }

    private static async Task<IResult> Login(
        LoginRequest request,
        ApplicationDbContext dbContext,
        HttpContext context
    )
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        var passwordHasher = new PasswordHasher<User>();

        if (
            user is null
            || string.IsNullOrEmpty(user.HashedPassword)
            || passwordHasher.VerifyHashedPassword(user, user.HashedPassword, request.Password)
                != PasswordVerificationResult.Success
        )
            return Results.Json(
                new ApiMessageResponse("Invalid email or password"),
                statusCode: StatusCodes.Status401Unauthorized
            );

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Name),
            new(ClaimTypes.Email, user.Email),
        };

        var claimsIdentity = new ClaimsIdentity(
            claims,
            CookieAuthenticationDefaults.AuthenticationScheme
        );
        var authProperties = new AuthenticationProperties
        {
            IsPersistent = request.RememberMe,
            ExpiresUtc = request.RememberMe ? DateTimeOffset.UtcNow.AddDays(7) : null,
        };

        await context.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(claimsIdentity),
            authProperties
        );

        return Results.Ok(user.ToCurrentUser());
    }

    private static async Task<NoContent> Logout(HttpContext context)
    {
        await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return TypedResults.NoContent();
    }

    private static async Task<Ok<CurrentUser>> GetCurrentUser(
        HttpContext httpContext,
        ApplicationDbContext dbContext
    )
    {
        var userIdClaim = httpContext.User.Claims.FirstOrDefault(c =>
            c.Type == ClaimTypes.NameIdentifier
        );

        var userId = Guid.Parse(userIdClaim!.Value);
        var user = await dbContext
            .Users.Where(u => u.Id == userId)
            .Select(u => new CurrentUser(
                Id: u.Id,
                Email: u.Email,
                Name: u.Name,
                CreatedAt: u.CreatedAt,
                UpdatedAt: u.UpdatedAt,
                EmailConfirmed: u.EmailConfirmed
            ))
            .FirstOrDefaultAsync();

        return TypedResults.Ok(user!);
    }

    private static async Task<IResult> CreateAccount(
        CreateUserRequest request,
        INotificationPublisher publisher,
        HttpContext context,
        ApplicationDbContext dbContext
    )
    {
        var user = new User { Name = request.Name, Email = request.Email };

        var passwordHasher = new PasswordHasher<User>();
        user.HashedPassword = passwordHasher.HashPassword(user, request.Password);

        dbContext.Users.Add(user);
        var result = await dbContext.SaveChangesAsync() > 0;

        if (!result)
        {
            return Results.BadRequest(
                new ApiMessageResponse(
                    "An error occurred while creating the account, try again later"
                )
            );
        }

        await publisher.PublishAsync(new ConfirmEmailNotification(user));

        return Results.Ok(user.ToCurrentUser());
    }

    private static async Task<IResult> ConfirmEmail(
        ConfirmEmailRequest request,
        ApplicationDbContext dbContext,
        INotificationPublisher publisher
    )
    {
        var user = await dbContext.Users.FindAsync(request.UserId);
        if (user is null)
            return Results.NotFound(
                new ApiMessageResponse(
                    "The user associated with this confirmation token was not found"
                )
            );

        if (user.EmailConfirmed)
            return Results.BadRequest(new ApiMessageResponse("Email is already confirmed"));

        var token = await dbContext.EmailConfirmationTokens.FirstOrDefaultAsync(t =>
            t.UserId == user.Id && t.Token == request.Token && t.ExpiresAt > DateTime.UtcNow
        );

        if (token is null)
            return Results.BadRequest(
                new ApiMessageResponse(
                    "The confirmation token is invalid or has expired, please request a new confirmation email"
                )
            );

        user.EmailConfirmed = true;
        dbContext.EmailConfirmationTokens.Remove(token);
        await dbContext.SaveChangesAsync();
        return Results.Ok(new ApiMessageResponse("Your email has been successfully confirmed"));
    }

    private static async Task<Ok<ApiMessageResponse>> ResendConfirmEmail(
        HttpContext context,
        INotificationPublisher publisher,
        ApplicationDbContext dbContext
    )
    {
        var userIdClaim = context.User.Claims.FirstOrDefault(c =>
            c.Type == ClaimTypes.NameIdentifier
        );
        var userId = Guid.Parse(userIdClaim!.Value);
        var user = await dbContext.Users.FindAsync(userId);

        if (user!.EmailConfirmed)
            return TypedResults.Ok(new ApiMessageResponse("Your email is already confirmed"));

        await publisher.PublishAsync(new ConfirmEmailNotification(user!));

        return TypedResults.Ok(
            new ApiMessageResponse("A new confirmation email has been sent to your email address")
        );
    }
}
