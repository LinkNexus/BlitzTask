using System.Collections.Concurrent;

namespace BlitzTask.Infrastructure.Notifications;

/// <summary>
/// Publishes notifications to all registered handlers
/// Handlers are executed in parallel by default
/// Supports pipeline behaviors for cross-cutting concerns
/// </summary>
public class NotificationPublisher : INotificationPublisher
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<NotificationPublisher> _logger;
    private readonly ConcurrentDictionary<Type, object> _handlerInvokerCache;
    private readonly ConcurrentDictionary<Type, object> _behaviorInvokerCache;

    public NotificationPublisher(
        IServiceProvider serviceProvider,
        ILogger<NotificationPublisher> logger
    )
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _handlerInvokerCache = new ConcurrentDictionary<Type, object>();
        _behaviorInvokerCache = new ConcurrentDictionary<Type, object>();
    }

    public async Task PublishAsync<TNotification>(
        TNotification notification,
        CancellationToken cancellationToken = default
    )
        where TNotification : INotification
    {
        if (notification == null)
        {
            throw new ArgumentNullException(nameof(notification));
        }

        var notificationType = notification.GetType();

        _logger.LogDebug("Publishing notification {NotificationType}", notificationType.Name);

        var handlerInvoker =
            (Func<TNotification, IServiceProvider, CancellationToken, Task>)
                _handlerInvokerCache.GetOrAdd(
                    notificationType,
                    nt =>
                    {
                        return CreateHandlerInvoker<TNotification>(nt);
                    }
                );

        await handlerInvoker(notification, _serviceProvider, cancellationToken);
    }

    private Func<
        TNotification,
        IServiceProvider,
        CancellationToken,
        Task
    > CreateHandlerInvoker<TNotification>(Type notificationType)
        where TNotification : INotification
    {
        var handlerType = typeof(INotificationHandler<>).MakeGenericType(notificationType);
        var handleMethod = handlerType.GetMethod("HandleAsync")!;

        return async (notification, serviceProvider, cancellationToken) =>
        {
            // Get all handlers for this notification type
            var handlers = serviceProvider.GetServices(handlerType);
            var handlersList = handlers.ToList();

            if (!handlersList.Any())
            {
                _logger.LogDebug(
                    "No handlers registered for notification {NotificationType}",
                    notificationType.Name
                );
                return;
            }

            _logger.LogDebug(
                "Found {HandlerCount} handlers for notification {NotificationType}",
                handlersList.Count,
                notificationType.Name
            );

            // Get pipeline behaviors for this notification type
            var behaviorType = typeof(IPipelineBehavior<>).MakeGenericType(notificationType);
            var behaviors = serviceProvider.GetServices(behaviorType).ToList();

            // Execute all handlers in parallel, each wrapped in the behavior pipeline
            var tasks = handlersList.Select(handler =>
            {
                // Create the handler execution delegate
                Func<Task> handlerDelegate = async () =>
                {
                    try
                    {
                        var task = (Task)
                            handleMethod.Invoke(
                                handler,
                                new object[] { notification, cancellationToken }
                            )!;
                        await task;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(
                            ex,
                            "Error invoking handler {HandlerType} for notification {NotificationType}",
                            handler.GetType().Name,
                            notificationType.Name
                        );
                        throw;
                    }
                };

                // Wrap the handler in the behavior pipeline
                return ExecuteWithBehaviors(
                    notification,
                    handlerDelegate,
                    behaviors,
                    notificationType,
                    cancellationToken
                );
            });

            await Task.WhenAll(tasks);

            _logger.LogDebug(
                "Completed publishing notification {NotificationType} to {HandlerCount} handlers",
                notificationType.Name,
                handlersList.Count
            );
        };
    }

    private async Task ExecuteWithBehaviors<TNotification>(
        TNotification notification,
        Func<Task> handler,
        List<object> behaviors,
        Type notificationType,
        CancellationToken cancellationToken
    )
        where TNotification : INotification
    {
        if (behaviors.Count == 0)
        {
            await handler();
            return;
        }

        // Build the behavior pipeline from the end to the beginning
        Func<Task> pipeline = handler;

        // Reverse iterate through behaviors to build the pipeline
        for (int i = behaviors.Count - 1; i >= 0; i--)
        {
            var behavior = behaviors[i];
            var currentPipeline = pipeline;

            // Capture the current pipeline step
            pipeline = async () =>
            {
                var behaviorType = typeof(IPipelineBehavior<>).MakeGenericType(notificationType);
                var handleMethod = behaviorType.GetMethod("Handle")!;

                var task = (Task)
                    handleMethod.Invoke(
                        behavior,
                        new object[] { notification, currentPipeline, cancellationToken }
                    )!;

                await task;
            };
        }

        // Execute the complete pipeline
        await pipeline();
    }
}

/// <summary>
/// Sequential notification publisher - executes handlers one at a time
/// Use this when handlers must execute in order or when you want to stop on first error
/// Supports pipeline behaviors for cross-cutting concerns
/// </summary>
public class SequentialNotificationPublisher : INotificationPublisher
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SequentialNotificationPublisher> _logger;

    public SequentialNotificationPublisher(
        IServiceProvider serviceProvider,
        ILogger<SequentialNotificationPublisher> logger
    )
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task PublishAsync<TNotification>(
        TNotification notification,
        CancellationToken cancellationToken = default
    )
        where TNotification : INotification
    {
        if (notification == null)
        {
            throw new ArgumentNullException(nameof(notification));
        }

        var notificationType = notification.GetType();
        var handlerType = typeof(INotificationHandler<>).MakeGenericType(notificationType);

        _logger.LogDebug(
            "Publishing notification {NotificationType} sequentially",
            notificationType.Name
        );

        var handlers = _serviceProvider.GetServices(handlerType).ToList();

        if (!handlers.Any())
        {
            _logger.LogDebug(
                "No handlers registered for notification {NotificationType}",
                notificationType.Name
            );
            return;
        }

        var handleMethod = handlerType.GetMethod("HandleAsync")!;

        // Get pipeline behaviors for this notification type
        var behaviorType = typeof(IPipelineBehavior<>).MakeGenericType(notificationType);
        var behaviors = _serviceProvider.GetServices(behaviorType).ToList();

        foreach (var handler in handlers)
        {
            // Create the handler execution delegate
            Func<Task> handlerDelegate = async () =>
            {
                try
                {
                    _logger.LogDebug(
                        "Executing handler {HandlerType} for notification {NotificationType}",
                        handler.GetType().Name,
                        notificationType.Name
                    );

                    var task = (Task)
                        handleMethod.Invoke(handler, [notification, cancellationToken])!;
                    await task;
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Error in handler {HandlerType} for notification {NotificationType}",
                        handler.GetType().Name,
                        notificationType.Name
                    );
                    throw;
                }
            };

            // Wrap the handler in the behavior pipeline and execute
            await ExecuteWithBehaviors(
                notification,
                handlerDelegate,
                behaviors,
                notificationType,
                cancellationToken
            );
        }

        _logger.LogDebug(
            "Completed sequential publishing of notification {NotificationType}",
            notificationType.Name
        );
    }

    private async Task ExecuteWithBehaviors<TNotification>(
        TNotification notification,
        Func<Task> handler,
        List<object> behaviors,
        Type notificationType,
        CancellationToken cancellationToken
    )
        where TNotification : INotification
    {
        if (behaviors.Count == 0)
        {
            await handler();
            return;
        }

        // Build the behavior pipeline from the end to the beginning
        Func<Task> pipeline = handler;

        // Reverse iterate through behaviors to build the pipeline
        for (int i = behaviors.Count - 1; i >= 0; i--)
        {
            var behavior = behaviors[i];
            var currentPipeline = pipeline;

            // Capture the current pipeline step
            pipeline = async () =>
            {
                var behaviorType = typeof(IPipelineBehavior<>).MakeGenericType(notificationType);
                var handleMethod = behaviorType.GetMethod("Handle")!;

                var task = (Task)
                    handleMethod.Invoke(
                        behavior,
                        [notification, currentPipeline, cancellationToken]
                    )!;

                await task;
            };
        }

        // Execute the complete pipeline
        await pipeline();
    }
}
