namespace BlitzTask.Infrastructure.Notifications;

/// <summary>
/// Marker interface for notifications (events that can have multiple handlers)
/// </summary>
public interface INotification
{
}

/// <summary>
/// Handler interface for processing notifications
/// Multiple handlers can subscribe to the same notification type
/// </summary>
/// <typeparam name="TNotification">The type of notification to handle</typeparam>
public interface INotificationHandler<in TNotification> where TNotification : INotification
{
    Task HandleAsync(TNotification notification, CancellationToken cancellationToken = default);
}

/// <summary>
/// Publisher interface for publishing notifications to all subscribers
/// </summary>
public interface INotificationPublisher
{
    Task PublishAsync<TNotification>(TNotification notification, CancellationToken cancellationToken = default)
        where TNotification : INotification;
}
