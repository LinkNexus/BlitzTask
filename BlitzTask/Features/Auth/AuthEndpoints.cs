using System.Net;
using System.Security.Claims;
using BlitzTask.Infrastructure.Data;
using BlitzTask.Infrastructure.Extensions;
using BlitzTask.Infrastructure.Filters;
using BlitzTask.Infrastructure.Notifications;
using BlitzTask.Shared.Models;
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
            .RequireRateLimiting("auth")
            .Produces<CurrentUser>()
            .Produces<ApiMessageResponse>(StatusCodes.Status401Unauthorized)
            .Produces<ApiMessageResponse>(StatusCodes.Status429TooManyRequests)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status422UnprocessableEntity);

        authGroup.MapPost("/logout", (Delegate)Logout).WithName("logout");

        authGroup
            .MapGet("/me", GetCurrentUser)
            .WithName("get-current-user")
            .RequireAuthorization()
            .Produces<CurrentUser>()
            .Produces<ApiMessageResponse>(StatusCodes.Status401Unauthorized);

        authGroup
            .MapPost("/create-account", CreateAccount)
            .WithName("create-account")
            .AddEndpointFilter<ValidationFilter<CreateUserRequest>>()
            .RequireRateLimiting("account-creation")
            .Produces<CurrentUser>()
            .Produces<ApiMessageResponse>(StatusCodes.Status400BadRequest)
            .Produces<ApiMessageResponse>(StatusCodes.Status429TooManyRequests)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status422UnprocessableEntity);

        authGroup
            .MapPost("/confirm-email", ConfirmEmail)
            .WithName("confirm-email")
            .AddEndpointFilter<ValidationFilter<ConfirmEmailRequest>>()
            .RequireRateLimiting("auth")
            .Produces<ApiMessageResponse>(StatusCodes.Status200OK)
            .Produces<ApiMessageResponse>(StatusCodes.Status400BadRequest)
            .Produces<ApiMessageResponse>(StatusCodes.Status429TooManyRequests)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status422UnprocessableEntity);

        authGroup
            .MapPost("/resend-confirm-email", ResendConfirmEmail)
            .WithName("resend-confirm-email")
            .RequireAuthorization();

        authGroup
            .MapPost("/request-password-reset", RequestPasswordReset)
            .WithName("request-password-reset")
            .AddEndpointFilter<ValidationFilter<RequestPasswordResetRequest>>()
            .RequireRateLimiting("password-reset")
            .Produces<ApiMessageResponse>(StatusCodes.Status429TooManyRequests)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status422UnprocessableEntity);

        authGroup
            .MapPost("/reset-password", ResetPassword)
            .WithName("reset-password")
            .AddEndpointFilter<ValidationFilter<ResetPasswordRequest>>()
            .RequireRateLimiting("auth")
            .Produces<ApiMessageResponse>(StatusCodes.Status200OK)
            .Produces<ApiMessageResponse>(StatusCodes.Status400BadRequest)
            .Produces<ApiMessageResponse>(StatusCodes.Status429TooManyRequests)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status422UnprocessableEntity);

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

    private static async Task<IResult> GetCurrentUser(
        HttpContext httpContext,
        ApplicationDbContext dbContext
    )
    {
        var user = httpContext.GetUser();

        if (user is null)
        {
            return Results.Json(
                new ApiMessageResponse("Unauthrized access, please login to access this resource"),
                statusCode: StatusCodes.Status401Unauthorized
            );
        }

        return Results.Ok(user.ToCurrentUser());
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

        var token = await dbContext.UserTokens.FirstOrDefaultAsync(t =>
            t.UserId == user.Id
            && t.TokenType == UserTokenType.EmailConfirmation
            && t.Token == request.Token
            && t.ExpiresAt > DateTime.UtcNow
        );

        if (token is null)
            return Results.BadRequest(
                new ApiMessageResponse(
                    "The confirmation token is invalid or has expired, please request a new confirmation email"
                )
            );

        user.EmailConfirmed = true;
        dbContext.UserTokens.Remove(token);
        await dbContext.SaveChangesAsync();
        return Results.Ok(new ApiMessageResponse("Your email has been successfully confirmed"));
    }

    private static async Task<Ok<ApiMessageResponse>> ResendConfirmEmail(
        HttpContext context,
        INotificationPublisher publisher,
        ApplicationDbContext dbContext
    )
    {
        var user = context.GetUser();

        if (user!.EmailConfirmed)
            return TypedResults.Ok(new ApiMessageResponse("Your email is already confirmed"));

        await publisher.PublishAsync(new ConfirmEmailNotification(user!));

        return TypedResults.Ok(
            new ApiMessageResponse("A new confirmation email has been sent to your email address")
        );
    }

    private static async Task<Ok<ApiMessageResponse>> RequestPasswordReset(
        RequestPasswordResetRequest request,
        ApplicationDbContext dbContext,
        INotificationPublisher publisher
    )
    {
        await publisher.PublishAsync(new PasswordResetNotification(request.Email));

        return TypedResults.Ok(
            new ApiMessageResponse(
                "If an account with that email exists, a password reset link has been sent"
            )
        );
    }

    private static async Task<IResult> ResetPassword(
        ResetPasswordRequest request,
        ApplicationDbContext dbContext
    )
    {
        var user = await dbContext.Users.FindAsync(request.UserId);
        if (user is null)
            return Results.NotFound(
                new ApiMessageResponse(
                    "The user associated with this password reset token was not found"
                )
            );

        var token = await dbContext.UserTokens.FirstOrDefaultAsync(t =>
            t.UserId == user.Id
            && t.TokenType == UserTokenType.PasswordReset
            && t.Token == request.Token
            && t.ExpiresAt > DateTime.UtcNow
        );

        if (token is null)
            return Results.BadRequest(
                new ApiMessageResponse(
                    "The password reset token is invalid or has expired, please request a new password reset email"
                )
            );

        var passwordHasher = new PasswordHasher<User>();
        user.HashedPassword = passwordHasher.HashPassword(user, request.NewPassword);

        dbContext.UserTokens.Remove(token);
        await dbContext.SaveChangesAsync();

        return Results.Ok(new ApiMessageResponse("Your password has been successfully reset"));
    }
}
