using System;

namespace BlitzTask.Infrastructure.Services;

public interface IFileService
{
    public Task<string> UploadFileAsync(IFormFile file, string directory);

    public Task DeleteFileAsync(string fileName, string drirectory);
}

public class LocalFileService : IFileService
{
    private readonly string _uploadDirectory;

    public LocalFileService(IConfiguration configuration)
    {
        _uploadDirectory = configuration["FileUpload:UploadDirectory"] ?? "Uploads";
        Directory.CreateDirectory(_uploadDirectory);
    }

    public async Task<string> UploadFileAsync(IFormFile file, string uploadDirectory)
    {
        var originalFileName = Path.GetFileName(file.FileName);
        var fileName = $"{Guid.NewGuid()}_{originalFileName}.{Path.GetExtension(originalFileName)}";
        var filePath = Path.Combine(Path.Combine(uploadDirectory, _uploadDirectory), fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return fileName;
    }

    public Task DeleteFileAsync(string fileName, string uploadDirectory)
    {
        var filePath = Path.Combine(Path.Combine(uploadDirectory, _uploadDirectory), fileName);
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        return Task.CompletedTask;
    }
}
