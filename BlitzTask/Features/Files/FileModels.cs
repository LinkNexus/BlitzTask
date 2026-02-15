using BlitzTask.Features.Auth;
using BlitzTask.Infrastructure.Data.Interfaces;

namespace BlitzTask.Features.Files;

public class File : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    /// <summary>
    /// Cryptographically secure filename stored on disk (without extension)
    /// </summary>
    public required string StoredFileName { get; set; }
    
    /// <summary>
    /// Original filename uploaded by user (sanitized)
    /// </summary>
    public required string OriginalFileName { get; set; }
    
    /// <summary>
    /// File extension (e.g., ".pdf", ".jpg")
    /// </summary>
    public required string Extension { get; set; }
    
    /// <summary>
    /// MIME type of the file
    /// </summary>
    public required string ContentType { get; set; }
    
    /// <summary>
    /// File size in bytes
    /// </summary>
    public long SizeInBytes { get; set; }
    
    /// <summary>
    /// The subdirectory where the file is stored (e.g., "avatars", "attachments")
    /// </summary>
    public required string StorageDirectory { get; set; }
    
    /// <summary>
    /// User who uploaded the file
    /// </summary>
    public Guid UploadedByUserId { get; set; }
    
    /// <summary>
    /// Full path to the file on disk (computed property for convenience)
    /// </summary>
    public string GetFullPath(string baseUploadDirectory)
    {
        return Path.Combine(baseUploadDirectory, StorageDirectory, $"{StoredFileName}{Extension}");
    }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public User UploadedByUser { get; set; } = null!;
}

public record FileMetadata(
    Guid Id,
    string OriginalFileName,
    string ContentType,
    long SizeInBytes,
    DateTime UploadedAt
);
