using BlitzTask.Infrastructure.Notifications;

namespace BlitzTask.Features.Auth;

public class ConfirmEmailNotification(User user) : INotification
{
    public User User { get; } = user;
}
