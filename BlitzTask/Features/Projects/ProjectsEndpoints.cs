using System.Reflection;
using BlitzTask.Infrastructure.Data;
using BlitzTask.Infrastructure.Extensions;
using BlitzTask.Infrastructure.Filters;
using BlitzTask.Infrastructure.Services;
using BlitzTask.Shared.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlitzTask.Features.Projects;

public static class ProjectsEndpoints
{
    public static IEndpointRouteBuilder MapProjectsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/projects")
            .WithTags("Projects")
            .RequireAuthorization("EmailConfirmed");

        // group.MapGet("/", GetProjects);
        group
            .MapGet("/{projectId}", GetProject)
            .WithName("get-project")
            .Produces<ProjectDetails>(StatusCodes.Status200OK);
        
        group
            .MapPost("/", CreateProject)
            .WithName("create-project")
            .AddEndpointFilter<ValidationFilter<CreateProjectRequest>>()
            .Produces<ProjectDetails>(StatusCodes.Status201Created)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status422UnprocessableEntity);

        return app;
    }

    private static async Task<IResult> CreateProject(
        [FromForm] CreateProjectRequest request,
        ApplicationDbContext dbContext,
        IFileService fileService,
        HttpContext context,
        CancellationToken cancellationToken
    )
    {
        var user = context.GetUser();

        Guid? imageId = null;

        if (request.Image is not null)
        {
            var uploadRes = await fileService.UploadFileAsync(
                request.Image,
                "images",
                user.Id,
                cancellationToken
            );

            if (uploadRes.Success && uploadRes.FileId.HasValue)
            {
                imageId = uploadRes.FileId.Value;
            }
        }

        var project = new Project
        {
            Name = request.Name,
            Description = request.Description,
            StartDate = request.StartDate,
            DueDate = request.DueDate,
            Tags = request.Tags ?? [],
            ImageId = imageId,
            CreatedBy = user,
            Participants =
            [
                new ProjectParticipant
                {
                    User = user,
                    Role = ProjectRole.Owner,
                    CreatedAt = DateTime.UtcNow,
                },
            ],
        };

        dbContext.Projects.Add(project);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Results.Json(
            new ProjectDetails(
                Id: project.Id,
                Name: project.Name,
                Description: project.Description,
                StartDate: project.StartDate,
                DueDate: project.DueDate,
                Tags: project.Tags,
                CreatedBy: project.CreatedBy.Id,
                Participants:
                [
                    .. project.Participants.Select(p => new ProjectParticipantInfo(
                        UserId: p.UserId,
                        Role: p.Role,
                        Name: p.User.Name,
                        JoinedAt: p.CreatedAt
                    )),
                ]
            )
        );
    }

    private static async Task<IResult> GetProject(
        Guid projectId,
        ApplicationDbContext dbContext,
        HttpContext context,
        CancellationToken cancellationToken
    )
    {
        var user = context.GetUser();

        // Fetch project with all necessary relations
        var project = await dbContext.Projects
            .Include(p => p.Participants)
                .ThenInclude(pp => pp.User)
            .Include(p => p.CreatedBy)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken);

        if (project == null)
        {
            return Results.Json(
                new ApiMessageResponse("Project not found"),
                statusCode: StatusCodes.Status404NotFound
            );
        }

        // Check if user is a participant of the project
        var isParticipant = project.Participants.Any(p => p.UserId == user.Id);
        if (!isParticipant)
        {
            return Results.Json(
                new ApiMessageResponse("You do not have access to this project"),
                statusCode: StatusCodes.Status403Forbidden
            );
        }

        return Results.Ok(
            new ProjectDetails(
                Id: project.Id,
                Name: project.Name,
                Description: project.Description,
                StartDate: project.StartDate,
                DueDate: project.DueDate,
                Tags: project.Tags,
                CreatedBy: project.CreatedBy.Id,
                Participants: project.Participants
                    .Select(p => new ProjectParticipantInfo(
                        UserId: p.UserId,
                        Role: p.Role,
                        Name: p.User.Name,
                        JoinedAt: p.CreatedAt
                    ))
                    .ToList()
            )
        );
    }
}
