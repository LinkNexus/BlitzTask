using BlitzTask.Features.Auth;
using BlitzTask.Infrastructure.Data.Interfaces;

namespace BlitzTask.Features.Projects;

public enum ProjectRole
{
    Owner,
    Admin,
    Contributor,
    Viewer,
}

public class Project : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset? StartDate { get; set; }
    public DateTimeOffset? DueDate { get; set; }
    public Guid? ImageId { get; set; }
    public List<string> Tags { get; set; } = [];
    public DateTime UpdatedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid CreatedById { get; set; }

    public List<ProjectParticipant> Participants { get; set; } = [];
    public User CreatedBy { get; set; } = null!;
    public Features.Files.File? Image { get; set; }
}

public class ProjectParticipant : ICreated
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }
    public Guid UserId { get; set; }
    public ProjectRole Role { get; set; }
    public DateTime CreatedAt { get; set; }

    public User User { get; set; } = null!;
    public Project Project { get; set; } = null!;
}

public record CreateProjectRequest(
    string Name,
    string Description,
    DateTimeOffset? StartDate,
    DateTimeOffset? DueDate,
    IFormFile? Image,
    List<string>? Tags
);

public record ProjectDetails(
    Guid Id,
    string Name,
    string Description,
    DateTimeOffset? StartDate,
    DateTimeOffset? DueDate,
    List<string> Tags,
    Guid CreatedBy,
    List<ProjectParticipantInfo> Participants
);

public record ProjectParticipantInfo(Guid UserId, string Name, ProjectRole Role, DateTime JoinedAt);
