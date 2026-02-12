namespace BlitzTask.Infrastructure.Notifications;

/// <summary>
/// Represents a pipeline behavior that wraps notification handler execution.
/// Use this to implement cross-cutting concerns like logging, error handling, metrics, etc.
/// </summary>
/// <typeparam name="TNotification">The type of notification being handled</typeparam>
public interface IPipelineBehavior<in TNotification>
    where TNotification : INotification
{
    /// <summary>
    /// Handle the notification by executing the next delegate in the pipeline
    /// </summary>
    /// <param name="notification">The notification instance</param>
    /// <param name="next">Awaitable delegate for the next action in the pipeline. Eventually this calls the handler.</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task Handle(TNotification notification, Func<Task> next, CancellationToken cancellationToken);
}
