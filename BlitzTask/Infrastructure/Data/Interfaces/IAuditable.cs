using System;

namespace BlitzTask.Infrastructure.Data.Interfaces;

public interface IAuditable
{
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
