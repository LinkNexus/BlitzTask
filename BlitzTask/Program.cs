using System.Threading.RateLimiting;
using BlitzTask.Features.Auth;
using BlitzTask.Infrastructure.Auth;
using BlitzTask.Infrastructure.Data;
using BlitzTask.Infrastructure.Notifications;
using BlitzTask.Infrastructure.Services;
using FluentValidation;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
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

        builder.Services.AddNotifications();

        builder.Services.AddAntiforgery(options =>
        {
            options.HeaderName = "X-CSRF-TOKEN";
        });

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

                options.Events = new CustomCookieAuthenticationEvents();
            });

        builder.Services.AddAuthorization();

        // Configure rate limiting
        builder.Services.AddRateLimiter(options =>
        {
            // Global rate limiter - 100 requests per minute per IP
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 100,
                        Window = TimeSpan.FromMinutes(1),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 0
                    }));

            // Strict rate limiter for authentication endpoints - 5 requests per minute per IP
            options.AddFixedWindowLimiter("auth", options =>
            {
                options.PermitLimit = 5;
                options.Window = TimeSpan.FromMinutes(1);
                options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                options.QueueLimit = 0;
            });

            // Moderate rate limiter for account creation - 3 requests per hour per IP
            options.AddFixedWindowLimiter("account-creation", options =>
            {
                options.PermitLimit = 3;
                options.Window = TimeSpan.FromHours(1);
                options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                options.QueueLimit = 0;
            });

            // Rate limiter for password reset - 3 requests per hour per IP
            options.AddFixedWindowLimiter("password-reset", options =>
            {
                options.PermitLimit = 3;
                options.Window = TimeSpan.FromHours(1);
                options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                options.QueueLimit = 0;
            });

            // Configure rejection response
            options.OnRejected = async (context, token) =>
            {
                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                
                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                {
                    await context.HttpContext.Response.WriteAsJsonAsync(new
                    {
                        message = $"Too many requests. Please try again after {retryAfter.TotalSeconds} seconds.",
                        retryAfter = retryAfter.TotalSeconds
                    }, cancellationToken: token);
                }
                else
                {
                    await context.HttpContext.Response.WriteAsJsonAsync(new
                    {
                        message = "Too many requests. Please try again later."
                    }, cancellationToken: token);
                }
            };
        });

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
        app.UseRateLimiter();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseAntiforgery();

        app.MapAuthEndpoints().MapFallbackToFile("index.html");

        app.Run();
    }
}
