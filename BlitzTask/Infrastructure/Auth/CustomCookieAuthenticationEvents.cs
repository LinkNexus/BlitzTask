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
        return context.Response.WriteAsJsonAsync(
            new ApiMessageResponse("You do not have permission to access this resource")
        );
    }

    public override Task RedirectToLogout(RedirectContext<CookieAuthenticationOptions> context)
    {
        return Task.CompletedTask;
    }
}
