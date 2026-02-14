using System.Security.Claims;
using BlitzTask.Features.Auth;
using BlitzTask.Infrastructure.Data;
using BlitzTask.Shared.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;

namespace BlitzTask.Infrastructure.Auth;

public class CustomCookieAuthenticationEvents : CookieAuthenticationEvents
{
    public override async Task ValidatePrincipal(CookieValidatePrincipalContext context)
    {
        var dbContext =
            context.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();

        var userIdClaim = context.Principal?.FindFirst(ClaimTypes.NameIdentifier);
        var securityStampClaim = context.Principal?.FindFirst("SecurityStamp");

        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            context.RejectPrincipal();
            return;
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null)
        {
            context.RejectPrincipal();
            return;
        }

        // Validate SecurityStamp - if it doesn't match, the session is invalid
        if (securityStampClaim is null || securityStampClaim.Value != user.SecurityStamp)
        {
            context.RejectPrincipal();
            await context.HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return;
        }

        context.HttpContext.Items["CurrentUser"] = user;
    }

    public override async Task RedirectToLogin(RedirectContext<CookieAuthenticationOptions> context)
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        await context.Response.WriteAsJsonAsync(
            new ApiMessageResponse("Unauthorized access, please login to access this resource")
        );
    }

    public override Task RedirectToAccessDenied(
        RedirectContext<CookieAuthenticationOptions> context
    )
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;

        // Check if this is due to email not being confirmed
        if (
            context.HttpContext.Items.TryGetValue("CurrentUser", out var userObj)
            && userObj is User user
            && !user.EmailConfirmed
        )
        {
            return context.HttpContext.Response.WriteAsJsonAsync(
                new ApiMessageResponse(
                    "Please confirm your email address to access this resource. Check your inbox for the confirmation email or request a new one."
                )
            );
        }

        return context.HttpContext.Response.WriteAsJsonAsync(
            new ApiMessageResponse("You do not have permission to access this resource")
        );
    }

    public override Task RedirectToLogout(RedirectContext<CookieAuthenticationOptions> context)
    {
        return Task.CompletedTask;
    }
}
