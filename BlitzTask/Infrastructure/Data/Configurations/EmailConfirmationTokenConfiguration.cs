using System;
using BlitzTask.Features.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BlitzTask.Infrastructure.Data.Configurations;

public class EmailConfirmationTokenConfiguration : IEntityTypeConfiguration<EmailConfirmationToken>
{
    public void Configure(EntityTypeBuilder<EmailConfirmationToken> builder)
    {
        builder.HasKey(e => e.Id);

        builder
            .HasOne(e => e.User)
            .WithOne(u => u.EmailConfirmationToken)
            .HasForeignKey<EmailConfirmationToken>(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(e => e.Token).IsRequired();
        builder.Property(e => e.ExpiresAt).IsRequired();
    }
}
