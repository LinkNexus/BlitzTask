using BlitzTask.Features.Auth;
using BlitzTask.Infrastructure.Services;

namespace BlitzTask.Infrastructure.Jobs;

public class EmailJobs(IMailerService mailerService, ILogger<EmailJobs> logger)
{
    public async Task SendPasswordResetEmail(string email, string resetLink)
    {
        logger.LogInformation("Sending password reset email to {Email}", email);

        try
        {
            await mailerService.SendEmailAsync(
                new EmailMessage(
                    To: [email],
                    Subject: "Reset Your Password",
                    TemplateName: "PasswordReset",
                    TemplateModel: new PasswordResetModel
                    {
                        UserName = email,
                        ResetLink = resetLink,
                    }
                )
            );

            logger.LogInformation("Password reset email sent successfully to {Email}", email);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send password reset email to {Email}", email);
            throw;
        }
    }

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
                        ConfirmationLink = confirmationLink,
                    }
                )
            );

            logger.LogInformation("Email confirmation sent successfully to {Email}", email);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email confirmation to {Email}", email);
            throw;
        }
    }
}
