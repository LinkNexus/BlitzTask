using System.Reflection;
using BlitzTask.Infrastructure.Notifications;
using BlitzTask.Infrastructure.Notifications.Behaviors;

namespace Microsoft.Extensions.DependencyInjection;

public static class NotificationServiceExtensions
{
    /// <summary>
    /// Registers the notification system with automatic handler discovery
    /// </summary>
    /// <param name="services">The service collection</param>
    /// <param name="assemblies">Assemblies to scan for handlers</param>
    /// <param name="useSequentialPublisher">If true, uses sequential publisher instead of parallel</param>
    /// <param name="addLoggingBehavior">If true, adds logging pipeline behavior (default: true)</param>
    /// <returns>The service collection for chaining</returns>
    public static IServiceCollection AddNotifications(
        this IServiceCollection services,
        Assembly[] assemblies,
        bool useSequentialPublisher = false,
        bool addLoggingBehavior = true
    )
    {
        // Register the publisher as scoped (not singleton) because handlers may depend on scoped services
        if (useSequentialPublisher)
        {
            services.AddScoped<INotificationPublisher, SequentialNotificationPublisher>();
        }
        else
        {
            services.AddScoped<INotificationPublisher, NotificationPublisher>();
        }

        // Register default pipeline behaviors
        if (addLoggingBehavior)
        {
            services.AddTransient(typeof(IPipelineBehavior<>), typeof(LoggingPipelineBehavior<>));
        }

        // Find and register all notification handlers
        var handlerTypes = assemblies
            .SelectMany(a => a.GetTypes())
            .Where(t => t is { IsClass: true, IsAbstract: false })
            .Where(t =>
                t.GetInterfaces()
                    .Any(i =>
                        i.IsGenericType
                        && i.GetGenericTypeDefinition() == typeof(INotificationHandler<>)
                    )
            )
            .ToList();

        foreach (var handlerType in handlerTypes)
        {
            var interfaces = handlerType
                .GetInterfaces()
                .Where(i =>
                    i.IsGenericType
                    && i.GetGenericTypeDefinition() == typeof(INotificationHandler<>)
                );

            foreach (var interfaceType in interfaces)
            {
                services.AddTransient(interfaceType, handlerType);
            }
        }

        return services;
    }

    /// <summary>
    /// Registers the notification system scanning the calling assembly
    /// </summary>
    public static IServiceCollection AddNotifications(
        this IServiceCollection services,
        bool useSequentialPublisher = false,
        bool addLoggingBehavior = true
    )
    {
        var assembly = Assembly.GetCallingAssembly();
        return services.AddNotifications([assembly], useSequentialPublisher, addLoggingBehavior);
    }

    /// <summary>
    /// Adds a custom pipeline behavior for all notifications
    /// </summary>
    public static IServiceCollection AddNotificationBehavior(
        this IServiceCollection services,
        Type behaviorType
    )
    {
        if (
            !behaviorType
                .GetInterfaces()
                .Any(i =>
                    i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IPipelineBehavior<>)
                )
        )
        {
            throw new ArgumentException(
                $"Type {behaviorType.Name} must implement IPipelineBehavior<>",
                nameof(behaviorType)
            );
        }

        services.AddTransient(typeof(IPipelineBehavior<>), behaviorType);
        return services;
    }

    /// <summary>
    /// Adds a custom pipeline behavior for a specific notification type
    /// </summary>
    public static IServiceCollection AddNotificationBehavior<TNotification, TBehavior>(
        this IServiceCollection services
    )
        where TNotification : INotification
        where TBehavior : class, IPipelineBehavior<TNotification>
    {
        services.AddTransient<IPipelineBehavior<TNotification>, TBehavior>();
        return services;
    }
}
