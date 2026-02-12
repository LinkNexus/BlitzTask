using System;
using BlitzTask.Infrastructure.Data.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BlitzTask.Infrastructure.Data.Configurations;

public static class EntityMappingExtensions
{
    public static void ConfigureAuditable<T>(this EntityTypeBuilder<T> builder)
        where T : class, IAuditable
    {
        builder.Property(e => e.CreatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");
        builder.Property(e => e.UpdatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");
    }
}
