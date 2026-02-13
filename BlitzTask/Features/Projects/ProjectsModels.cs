using System;
using BlitzTask.Features.Auth;
using BlitzTask.Infrastructure.Data.Interfaces;
using Org.BouncyCastle.Ocsp;

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
    public string? ImageName { get; set; }
    public List<string> Tags { get; set; } = [];
    public DateTime UpdatedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid CreatedBy { get; set; }

    public List<ProjectParticipant> Participants { get; set; } = [];
}

public class ProjectParticipant
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
    List<string> Tags
);

public record ProjectDetails(
    Guid Id,
    string Name,
    string Description,
    DateTimeOffset? StartDate,
    DateTimeOffset? DueDate,
    string? ImageName,
    List<string> Tags,
    Guid CreatedBy,
    List<ProjectParticipantInfo> Participants
);

public record ProjectParticipantInfo(Guid UserId, string Name, ProjectRole Role, DateTime JoinedAt);
