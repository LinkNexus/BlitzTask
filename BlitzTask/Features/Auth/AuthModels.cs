using BlitzTask.Infrastructure.Data.Interfaces;

namespace BlitzTask.Features.Auth;

public class User : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string HashedPassword { get; set; } = string.Empty;
    public bool EmailConfirmed { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public EmailConfirmationToken? EmailConfirmationToken { get; set; }
}

public class EmailConfirmationToken
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }

    public User User { get; set; } = null!;
}

public record LoginRequest(string Email, string Password, bool RememberMe);

public record CurrentUser(
    Guid Id,
    string Email,
    string Name,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    bool EmailConfirmed
);

public record CreateUserRequest(string Name, string Email, string Password, string ConfirmPassword);

public record ConfirmEmailRequest(Guid UserId, string Token);

public class ConfirmEmailModel
{
    public required string UserName { get; set; }
    public required string ConfirmationLink { get; set; }
}
