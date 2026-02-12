using System.Diagnostics;

namespace BlitzTask.Infrastructure.Notifications.Behaviors;

/// <summary>
/// Pipeline behavior that logs notification execution and catches errors
/// </summary>
public class LoggingPipelineBehavior<TNotification> : IPipelineBehavior<TNotification>
    where TNotification : INotification
{
    private readonly ILogger<LoggingPipelineBehavior<TNotification>> _logger;

    public LoggingPipelineBehavior(ILogger<LoggingPipelineBehavior<TNotification>> logger)
    {
        _logger = logger;
    }

    public async Task Handle(
        TNotification notification,
        Func<Task> next,
        CancellationToken cancellationToken
    )
    {
        var notificationName = typeof(TNotification).Name;
        var stopwatch = Stopwatch.StartNew();

        try
        {
            _logger.LogInformation("Handling notification {NotificationName}", notificationName);

            await next();

            stopwatch.Stop();
            _logger.LogInformation(
                "Handled notification {NotificationName} in {ElapsedMilliseconds}ms",
                notificationName,
                stopwatch.ElapsedMilliseconds
            );
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(
                ex,
                "Error handling notification {NotificationName} after {ElapsedMilliseconds}ms: {ErrorMessage}",
                notificationName,
                stopwatch.ElapsedMilliseconds,
                ex.Message
            );

            // Re-throw to allow other behaviors or the caller to handle
            throw;
        }
    }
}
