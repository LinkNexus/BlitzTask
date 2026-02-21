using System;
using BlitzTask.Features.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BlitzTask.Infrastructure.Data.Configurations;

public class UserTokenConfiguration : IEntityTypeConfiguration<UserToken>
{
    public void Configure(EntityTypeBuilder<UserToken> builder)
    {
        builder.HasKey(e => e.Id);

        builder
            .HasOne(e => e.User)
            .WithMany(u => u.Tokens)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(e => e.Token).IsRequired();
        builder.Property(e => e.ExpiresAt).IsRequired();
    }
}
