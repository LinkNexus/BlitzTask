using System.Net;
using System.Security.Cryptography;
using BlitzTask.Features.Auth;
using BlitzTask.Infrastructure.Data;
using BlitzTask.Infrastructure.Jobs;
using Hangfire;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BlitzTask.Infrastructure.Notifications.Handlers;

/// <summary>
/// Handles ConfirmEmailNotification by queuing a background job to send the confirmation email
/// </summary>
public class ConfirmEmailNotificationHandler(
    ApplicationDbContext dbContext,
    IHttpContextAccessor httpContextAccessor,
    IBackgroundJobClient backgroundJobClient
) : INotificationHandler<ConfirmEmailNotification>
{
    public async Task HandleAsync(
        ConfirmEmailNotification notification,
        CancellationToken cancellationToken = default
    )
    {
        var token = await dbContext.UserTokens.FirstOrDefaultAsync(
            t =>
                t.UserId == notification.User.Id
                && t.TokenType == UserTokenType.EmailConfirmation,
            cancellationToken
        );

        if (token is null)
        {
            token = new UserToken
            {
                User = notification.User,
                Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)),
                TokenType = UserTokenType.EmailConfirmation,
                ExpiresAt = DateTime.UtcNow.AddHours(24),
            };
        }
        else
        {
            token.Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            token.ExpiresAt = DateTime.UtcNow.AddHours(24);
        }

        if (token.Id == 0)
            dbContext.UserTokens.Add(token);
        await dbContext.SaveChangesAsync(cancellationToken);

        var context =
            httpContextAccessor.HttpContext
            ?? throw new InvalidOperationException("HttpContext is not available");

        var encodedToken = WebUtility.UrlEncode(token.Token);
        var confirmationLink =
            $"{context.Request.Scheme}://{context.Request.Host}/confirm-email?token={encodedToken}&userId={notification.User.Id}";

        backgroundJobClient.Enqueue<EmailJobs>(x =>
            x.SendEmailConfirmation(
                notification.User.Email!,
                notification.User.Name!,
                confirmationLink
            )
        );
    }
}
