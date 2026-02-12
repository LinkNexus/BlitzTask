using BlitzTask.Features.Auth;
using BlitzTask.Infrastructure.Data;
using BlitzTask.Infrastructure.Models;
using BlitzTask.Infrastructure.Notifications;
using BlitzTask.Infrastructure.Services;
using FluentValidation;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RazorLight;
using Resend;
using SharpGrip.FluentValidation.AutoValidation.Endpoints.Extensions;

namespace BlitzTask;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Register HttpContextAccessor for accessing HttpContext in services
        builder.Services.AddHttpContextAccessor();

        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
        );

        builder.Services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>();
        builder.Services.AddFluentValidationAutoValidation();

        var razorEngine = new RazorLightEngineBuilder()
            .UseFileSystemProject(
                Path.Combine(Directory.GetCurrentDirectory(), "Templates", "Email")
            )
            .UseMemoryCachingProvider()
            .Build();
        builder.Services.AddSingleton(razorEngine);

        if (builder.Environment.IsDevelopment())
        {
            builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("Smtp"));
            builder.Services.AddScoped<IMailerService, SmtpMailerService>();
        }
        else
        {
            builder.Services.Configure<ResendSettings>(builder.Configuration.GetSection("Resend"));

            builder
                .Services.AddOptions<ResendClientOptions>()
                .Configure<IConfiguration>(
                    (options, _) =>
                    {
                        options.ApiToken =
                            Environment.GetEnvironmentVariable("RESEND_API_KEY") ?? string.Empty;
                    }
                );
            builder.Services.AddHttpClient<ResendClient>();
            builder.Services.AddScoped<IResend, ResendClient>();
            builder.Services.AddScoped<IMailerService, ResendMailerService>();
        }

        // Register notification system
        builder.Services.AddNotifications();

        builder.Services.AddAntiforgery(options =>
        {
            options.HeaderName = "X-CSRF-TOKEN";
        });

        // Configure Hangfire with PostgreSQL storage
        builder.Services.AddHangfire(configuration =>
            configuration
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UsePostgreSqlStorage(options =>
                    options.UseNpgsqlConnection(
                        builder.Configuration.GetConnectionString("DefaultConnection")
                    )
                )
        );

        // Add the Hangfire server
        builder.Services.AddHangfireServer(options =>
        {
            options.WorkerCount = Environment.ProcessorCount * 2;
            options.ServerName = $"{Environment.MachineName}:{Guid.NewGuid()}";
        });

        builder
            .Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.Cookie.SameSite = SameSiteMode.Strict;

                options.Events.OnRedirectToLogin = context =>
                {
                    context.Response.StatusCode = 401;
                    return context.Response.WriteAsJsonAsync(
                        new ApiMessageResponse(
                            "Unauthorized access to this resource, please login first"
                        )
                    );
                };

                options.Events.OnRedirectToAccessDenied = context =>
                {
                    context.Response.StatusCode = 403;
                    return context.Response.WriteAsJsonAsync(
                        new ApiMessageResponse("You do not have permission to access this resource")
                    );
                };
            });

        builder.Services.AddAuthorization();

        builder.Services.AddOpenApi(options =>
        {
            options.AddDocumentTransformer(
                (document, context, cancellationToken) =>
                {
                    document.Servers?.Clear();
                    return Task.CompletedTask;
                }
            );
        });

        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi("/api/openapi/{documentName}.json");
            app.UseDeveloperExceptionPage();

            // Hangfire Dashboard (only in development for now)
            app.UseHangfireDashboard(
                "/hangfire",
                new DashboardOptions { DashboardTitle = "BlitzTask Background Jobs" }
            );
        }

        app.UseStaticFiles();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseAntiforgery();

        app.MapAuthEndpoints().MapFallbackToFile("index.html");

        app.Run();
    }
}
