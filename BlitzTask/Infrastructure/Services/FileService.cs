using System.Security.Cryptography;
using BlitzTask.Features.Files;
using BlitzTask.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BlitzTask.Infrastructure.Services;

public interface IFileService
{
    Task<FileUploadResult> UploadFileAsync(
        IFormFile file,
        string directory,
        Guid uploadedByUserId,
        CancellationToken cancellationToken = default
    );

    Task<FileDownloadResult?> GetFileAsync(
        Guid fileId,
        CancellationToken cancellationToken = default
    );

    Task<bool> DeleteFileAsync(Guid fileId, CancellationToken cancellationToken = default);

    Task<Features.Files.File?> GetFileMetadataAsync(
        Guid fileId,
        CancellationToken cancellationToken = default
    );
}

public record FileUploadResult(
    bool Success,
    string? ErrorMessage,
    Guid? FileId,
    FileMetadata? Metadata
);

public record FileDownloadResult(Stream FileStream, string FileName, string ContentType);

public class LocalFileService : IFileService
{
    private readonly string _baseUploadDirectory;
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<LocalFileService> _logger;

    // Configuration constants
    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB default

    // Allowed file types - whitelist approach for security
    private static readonly Dictionary<string, HashSet<string>> AllowedFileTypes = new()
    {
        // Images
        ["image/jpeg"] = [".jpg", ".jpeg"],
        ["image/png"] = [".png"],
        ["image/gif"] = [".gif"],
        ["image/webp"] = [".webp"],

        // Documents
        ["application/pdf"] = [".pdf"],
        ["text/plain"] = [".txt"],

        // Office documents
        ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"] = [".docx"],
        ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] = [".xlsx"],
        ["application/vnd.openxmlformats-officedocument.presentationml.presentation"] = [".pptx"],

        // Archives
        ["application/zip"] = [".zip"],
    };

    // Allowed subdirectories - whitelist to prevent path traversal
    private static readonly HashSet<string> AllowedDirectories =
    [
        "avatars",
        "attachments",
        "documents",
        "images",
    ];

    public LocalFileService(
        IConfiguration configuration,
        ApplicationDbContext dbContext,
        ILogger<LocalFileService> logger
    )
    {
        _dbContext = dbContext;
        _logger = logger;
        _baseUploadDirectory = configuration["FileUpload:UploadDirectory"] ?? "Uploads";

        // Ensure base upload directory exists
        Directory.CreateDirectory(_baseUploadDirectory);

        // Create allowed subdirectories
        foreach (var dir in AllowedDirectories)
        {
            Directory.CreateDirectory(Path.Combine(_baseUploadDirectory, dir));
        }

        _logger.LogInformation(
            "FileService initialized with base directory: {BaseDirectory}",
            _baseUploadDirectory
        );
    }

    public async Task<FileUploadResult> UploadFileAsync(
        IFormFile file,
        string directory,
        Guid uploadedByUserId,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Validate directory (prevent path traversal)
            if (!ValidateDirectory(directory))
            {
                _logger.LogWarning(
                    "Invalid directory requested: {Directory} by user {UserId}",
                    directory,
                    uploadedByUserId
                );
                return new FileUploadResult(false, "Invalid directory specified", null, null);
            }

            // Validate file exists
            if (file == null || file.Length == 0)
            {
                return new FileUploadResult(false, "No file provided", null, null);
            }

            // Validate file size
            if (file.Length > MaxFileSizeBytes)
            {
                _logger.LogWarning(
                    "File size {Size} exceeds limit {MaxSize} for user {UserId}",
                    file.Length,
                    MaxFileSizeBytes,
                    uploadedByUserId
                );
                return new FileUploadResult(
                    false,
                    $"File size exceeds maximum allowed size of {MaxFileSizeBytes / 1024 / 1024} MB",
                    null,
                    null
                );
            }

            // Validate file type
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var contentType = file.ContentType.ToLowerInvariant();

            if (!ValidateFileType(contentType, extension))
            {
                _logger.LogWarning(
                    "Invalid file type: {ContentType} / {Extension} for user {UserId}",
                    contentType,
                    extension,
                    uploadedByUserId
                );
                return new FileUploadResult(
                    false,
                    $"File type not allowed. Allowed types: images, PDFs, and common office documents",
                    null,
                    null
                );
            }

            // Generate cryptographically secure filename
            var storedFileName = GenerateSecureFileName();
            var sanitizedOriginalFileName = SanitizeFileName(
                Path.GetFileNameWithoutExtension(file.FileName)
            );

            // Build safe file path
            var targetDirectory = Path.Combine(_baseUploadDirectory, directory);
            var filePath = Path.Combine(targetDirectory, $"{storedFileName}{extension}");

            // Double-check that the final path is within allowed directory (defense in depth)
            var fullTargetPath = Path.GetFullPath(filePath);
            var fullBasePath = Path.GetFullPath(_baseUploadDirectory);

            if (!fullTargetPath.StartsWith(fullBasePath, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogError(
                    "Path traversal attempt detected! Target: {Target}, Base: {Base}",
                    fullTargetPath,
                    fullBasePath
                );
                return new FileUploadResult(false, "Security violation detected", null, null);
            }

            // Create file entity
            var fileEntity = new Features.Files.File
            {
                StoredFileName = storedFileName,
                OriginalFileName = $"{sanitizedOriginalFileName}{extension}",
                Extension = extension,
                ContentType = contentType,
                SizeInBytes = file.Length,
                StorageDirectory = directory,
                UploadedByUserId = uploadedByUserId,
            };

            // Save file to disk using async I/O
            await using (
                var stream = new FileStream(
                    filePath,
                    FileMode.Create,
                    FileAccess.Write,
                    FileShare.None,
                    bufferSize: 4096,
                    useAsync: true
                )
            )
            {
                await file.CopyToAsync(stream, cancellationToken);
            }

            // Save metadata to database
            _dbContext.Files.Add(fileEntity);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "File uploaded successfully. ID: {FileId}, Original: {OriginalName}, Size: {Size} bytes, User: {UserId}",
                fileEntity.Id,
                fileEntity.OriginalFileName,
                fileEntity.SizeInBytes,
                uploadedByUserId
            );

            var metadata = new FileMetadata(
                fileEntity.Id,
                fileEntity.OriginalFileName,
                fileEntity.ContentType,
                fileEntity.SizeInBytes,
                fileEntity.CreatedAt
            );

            return new FileUploadResult(true, null, fileEntity.Id, metadata);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file for user {UserId}", uploadedByUserId);
            return new FileUploadResult(
                false,
                "An error occurred while uploading the file",
                null,
                null
            );
        }
    }

    public async Task<FileDownloadResult?> GetFileAsync(
        Guid fileId,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Retrieve file metadata from database
            var fileEntity = await _dbContext
                .Files.AsNoTracking()
                .FirstOrDefaultAsync(f => f.Id == fileId, cancellationToken);

            if (fileEntity == null)
            {
                _logger.LogWarning("File not found: {FileId}", fileId);
                return null;
            }

            // Get file path
            var filePath = fileEntity.GetFullPath(_baseUploadDirectory);

            // Verify file exists on disk
            if (!System.IO.File.Exists(filePath))
            {
                _logger.LogError(
                    "File metadata exists but file not found on disk: {FilePath}",
                    filePath
                );
                return null;
            }

            // Open file stream asynchronously
            var fileStream = new FileStream(
                filePath,
                FileMode.Open,
                FileAccess.Read,
                FileShare.Read,
                bufferSize: 4096,
                useAsync: true
            );

            _logger.LogInformation("File retrieved: {FileId}", fileId);

            return new FileDownloadResult(
                fileStream,
                fileEntity.OriginalFileName,
                fileEntity.ContentType
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving file {FileId}", fileId);
            return null;
        }
    }

    public async Task<bool> DeleteFileAsync(
        Guid fileId,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Retrieve file metadata
            var fileEntity = await _dbContext.Files.FirstOrDefaultAsync(
                f => f.Id == fileId,
                cancellationToken
            );

            if (fileEntity == null)
            {
                _logger.LogWarning("Attempted to delete non-existent file: {FileId}", fileId);
                return false;
            }

            // Delete file from disk
            var filePath = fileEntity.GetFullPath(_baseUploadDirectory);
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            // Delete metadata from database
            _dbContext.Files.Remove(fileEntity);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("File deleted: {FileId}", fileId);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file {FileId}", fileId);
            return false;
        }
    }

    public async Task<Features.Files.File?> GetFileMetadataAsync(
        Guid fileId,
        CancellationToken cancellationToken = default
    )
    {
        return await _dbContext
            .Files.AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == fileId, cancellationToken);
    }

    private static bool ValidateDirectory(string directory)
    {
        // Check if directory is in whitelist
        if (!AllowedDirectories.Contains(directory))
        {
            return false;
        }

        // Additional check for path traversal attempts
        if (
            directory.Contains("..")
            || directory.Contains("/")
            || directory.Contains("\\")
            || Path.IsPathRooted(directory)
        )
        {
            return false;
        }

        return true;
    }

    private static bool ValidateFileType(string contentType, string extension)
    {
        // Check if content type is allowed
        if (!AllowedFileTypes.TryGetValue(contentType, out var allowedExtensions))
        {
            return false;
        }

        // Check if extension matches the content type
        return allowedExtensions.Contains(extension);
    }

    private static string GenerateSecureFileName()
    {
        // Generate cryptographically secure random filename
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert
            .ToBase64String(bytes)
            .Replace("+", "")
            .Replace("/", "")
            .Replace("=", "")
            .Substring(0, 32);
    }

    private static string SanitizeFileName(string fileName)
    {
        // Remove invalid characters and limit length
        var invalidChars = Path.GetInvalidFileNameChars();
        var sanitized = string.Join(
            "_",
            fileName.Split(invalidChars, StringSplitOptions.RemoveEmptyEntries)
        );

        // Limit length
        if (sanitized.Length > 100)
        {
            sanitized = sanitized.Substring(0, 100);
        }

        return sanitized;
    }
}
