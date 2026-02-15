using System;
using BlitzTask.Features.Projects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BlitzTask.Infrastructure.Data.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.Property(p => p.Name).IsRequired().HasMaxLength(100);
        builder.Property(p => p.Description).IsRequired().HasMaxLength(1000);

        builder
            .HasMany(p => p.Participants)
            .WithOne(pp => pp.Project)
            .HasForeignKey(pp => pp.ProjectId);

        builder
            .HasOne(p => p.CreatedBy)
            .WithMany()
            .HasForeignKey(p => p.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasOne(p => p.Image)
            .WithMany()
            .HasForeignKey(p => p.ImageId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.ConfigureAuditable();
    }
}

public class ProjectParticipantConfiguration : IEntityTypeConfiguration<ProjectParticipant>
{
    public void Configure(EntityTypeBuilder<ProjectParticipant> builder)
    {
        builder
            .HasOne(pp => pp.Project)
            .WithMany(p => p.Participants)
            .HasForeignKey(pp => pp.ProjectId);

        builder
            .HasOne(pp => pp.User)
            .WithMany(u => u.ProjectParticipations)
            .HasForeignKey(pp => pp.UserId);
    }
}
