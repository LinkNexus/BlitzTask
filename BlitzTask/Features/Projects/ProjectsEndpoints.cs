using System.Reflection;
using BlitzTask.Infrastructure.Data;
using BlitzTask.Infrastructure.Extensions;
using BlitzTask.Infrastructure.Filters;
using BlitzTask.Infrastructure.Services;
using BlitzTask.Shared.Models;
using Microsoft.AspNetCore.Mvc;

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
            .MapPost("/", CreateProject)
            .WithName("create-project")
            .AddEndpointFilter<ValidationFilter<CreateProjectRequest>>()
            .Produces<ProjectDetails>(StatusCodes.Status201Created)
            .Produces<ApiMessageResponse>(StatusCodes.Status403Forbidden)
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
                Participants: project
                    .Participants.Select(p => new ProjectParticipantInfo(
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
