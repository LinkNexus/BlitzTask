using System;

namespace BlitzTask.Infrastructure.Data.Interfaces;

public interface ICreated
{
    public DateTime CreatedAt { get; set; }
}

public interface IAuditable : ICreated
{
    public DateTime UpdatedAt { get; set; }
}
