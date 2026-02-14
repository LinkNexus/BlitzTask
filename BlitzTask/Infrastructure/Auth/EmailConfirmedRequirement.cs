using BlitzTask.Features.Auth;
using Microsoft.AspNetCore.Authorization;

namespace BlitzTask.Infrastructure.Auth;

public class EmailConfirmedRequirement : IAuthorizationRequirement
{
}

public class EmailConfirmedHandler : AuthorizationHandler<EmailConfirmedRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        EmailConfirmedRequirement requirement
    )
    {
        // Check if the current user exists in HttpContext.Items
        if (context.Resource is HttpContext httpContext)
        {
            if (
                httpContext.Items.TryGetValue("CurrentUser", out var userObj)
                && userObj is User user
            )
            {
                if (user.EmailConfirmed)
                {
                    context.Succeed(requirement);
                }
            }
        }

        return Task.CompletedTask;
    }
}
