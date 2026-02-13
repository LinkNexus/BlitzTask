using System;
using System.Net;
using BlitzTask.Features.Auth;
using BlitzTask.Infrastructure.Data;
using BlitzTask.Infrastructure.Jobs;
using Hangfire;

namespace BlitzTask.Infrastructure.Notifications.Handlers;

public class PasswordResetNotificationHandler(
    IHttpContextAccessor httpContextAccessor,
    IBackgroundJobClient backgroundJobClient,
    ApplicationDbContext dbContext
) : INotificationHandler<PasswordResetNotification>
{
    public async Task HandleAsync(
        PasswordResetNotification notification,
        CancellationToken cancellationToken = default
    )
    {
        var user = dbContext.Users.FirstOrDefault(u => u.Email == notification.Email);

        if (user is null)
            return;

        var token = dbContext.UserTokens.FirstOrDefault(t =>
            t.UserId == user.Id && t.TokenType == UserTokenType.PasswordReset
        );

        if (token is null)
        {
            token = new UserToken
            {
                User = user,
                Token = Guid.NewGuid().ToString(),
                TokenType = UserTokenType.PasswordReset,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
            };
        }
        else
        {
            token.Token = Guid.NewGuid().ToString();
            token.ExpiresAt = DateTime.UtcNow.AddHours(1);
        }

        if (token.Id == 0)
            dbContext.UserTokens.Add(token);
        await dbContext.SaveChangesAsync(cancellationToken);

        var context =
            httpContextAccessor.HttpContext
            ?? throw new InvalidOperationException("HttpContext is not available");

        var encodedToken = WebUtility.UrlEncode(token.Token);
        var resetLink =
            $"{context.Request.Scheme}://{context.Request.Host}/reset-password?token={encodedToken}&userId={user.Id}";

        backgroundJobClient.Enqueue<EmailJobs>(x =>
            x.SendPasswordResetEmail(notification.Email, resetLink)
        );
    }
}
