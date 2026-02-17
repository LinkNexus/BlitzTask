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
    /// <summary>
    /// Reusable query extension to project Project entity to ProjectDetails DTO
    /// </summary>
    private static IQueryable<ProjectDetails> SelectProjectDetails(
        this IQueryable<Project> projects
    )
    {
        return projects.Select(p => new ProjectDetails(
            p.Id,
            p.Name,
            p.Description,
            p.StartDate,
            p.DueDate,
            p.Tags,
            p.CreatedBy.Id,
            p.Participants.Select(pp => new ProjectParticipantInfo(
                    pp.UserId,
                    pp.User.Name,
                    pp.Role,
                    pp.CreatedAt
                ))
                .ToList()
        ));
    }

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

        // Fetch the created project with all details using the reusable projection
        var projectDetails = await dbContext
            .Projects.Where(p => p.Id == project.Id)
            .SelectProjectDetails()
            .AsNoTracking()
            .FirstAsync(cancellationToken);

        return Results.Json(projectDetails, statusCode: StatusCodes.Status201Created);
    }

    private static async Task<IResult> GetProject(
        Guid projectId,
        ApplicationDbContext dbContext,
        HttpContext context,
        CancellationToken cancellationToken
    )
    {
        var user = context.GetUser();

        var project = await dbContext
            .Projects.Where(p =>
                p.Id == projectId && p.Participants.Any(pp => pp.UserId == user.Id)
            )
            .SelectProjectDetails()
            .AsNoTracking()
            .FirstOrDefaultAsync(cancellationToken);

        if (project == null)
        {
            return Results.Json(
                new ApiMessageResponse("Project not found"),
                statusCode: StatusCodes.Status404NotFound
            );
        }

        return Results.Ok(project);
    }
}
