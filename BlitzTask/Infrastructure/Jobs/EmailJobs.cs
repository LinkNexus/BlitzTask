using BlitzTask.Features.Auth;
using BlitzTask.Infrastructure.Services;

namespace BlitzTask.Infrastructure.Jobs;

/// <summary>
/// Background jobs for sending emails via Hangfire
/// These methods are called by Hangfire workers
/// </summary>
public class EmailJobs(IMailerService mailerService, ILogger<EmailJobs> logger)
{
    /// <summary>
    /// Send a password reset email
    /// Usage: BackgroundJob.Enqueue<EmailJobs>(x => x.SendPasswordResetEmail(email, resetLink));
    /// </summary>
    public async Task SendPasswordResetEmail(string email, string resetLink)
    {
        logger.LogInformation("Sending password reset email to {Email}", email);

        try
        {
            await mailerService.SendEmailAsync(
                new EmailMessage(
                    To: [email],
                    Subject: "Reset Your Password",
                    HtmlBody: $"<p>Click the link below to reset your password:</p><a href=\"{resetLink}\">Reset Password</a>"
                )
            );

            logger.LogInformation("Password reset email sent successfully to {Email}", email);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send password reset email to {Email}", email);
            throw; // Hangfire will retry on failure
        }
    }

    /// <summary>
    /// Send email confirmation with template
    /// Usage: BackgroundJob.Enqueue<EmailJobs>(x => x.SendEmailConfirmation(email, userName, confirmationLink));
    /// </summary>
    public async Task SendEmailConfirmation(string email, string userName, string confirmationLink)
    {
        logger.LogInformation("Sending email confirmation to {Email}", email);

        try
        {
            await mailerService.SendEmailAsync(
                new EmailMessage(
                    To: [email],
                    Subject: "Confirm your email address",
                    TemplateName: "ConfirmEmail",
                    TemplateModel: new ConfirmEmailModel
                    {
                        UserName = userName,
                        ConfirmationLink = confirmationLink
                    }
                )
            );

            logger.LogInformation("Email confirmation sent successfully to {Email}", email);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email confirmation to {Email}", email);
            throw; // Hangfire will retry on failure
        }
    }
}
