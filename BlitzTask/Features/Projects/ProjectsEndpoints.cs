using System;
using BlitzTask.Infrastructure.Data;
using BlitzTask.Infrastructure.Extensions;
using BlitzTask.Infrastructure.Filters;
using Microsoft.AspNetCore.Mvc;

namespace BlitzTask.Features.Projects;

public static class ProjectsEndpoints
{
    public static IEndpointRouteBuilder MapProjectsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/projects").WithTags("Projects").RequireAuthorization();

        // group.MapGet("/", GetProjects);
        group
            .MapPost("/", CreateProject)
            .WithName("create-project")
            .AddEndpointFilter<ValidationFilter<CreateProjectRequest>>()
            .Produces<Project>(StatusCodes.Status201Created)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status422UnprocessableEntity);

        return app;
    }

    private static async Task<IResult> CreateProject(
        [FromForm] CreateProjectRequest request,
        ApplicationDbContext dbContext,
        HttpContext context
    )
    {
        var user = context.GetUser();
        var project = new Project
        {
            Name = request.Name,
            Description = request.Description,
            StartDate = request.StartDate,
            DueDate = request.DueDate,
            Tags = request.Tags,
            CreatedBy = user.Id,
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
        await dbContext.SaveChangesAsync();

        return Results.Json(
            // new ProjectDetails(
            //     Id: project.Id,
            //     Name: project.Name,
            //     Description: project.Description,
            //     StartDate: project.StartDate,
            //     DueDate: project.DueDate,
            //     Tags: project.Tags,
            //     CreatedBy: project.CreatedBy,
            //     Participants: project
            //         .Participants.Select(p => new ProjectParticipantInfo(
            //             UserId: p.UserId,
            //             Role: p.Role,
            //             Name: p.User.Name,
            //             JoinedAt: p.CreatedAt
            //         ))
            //         .ToList()
            // )
            project
        );
    }
}
