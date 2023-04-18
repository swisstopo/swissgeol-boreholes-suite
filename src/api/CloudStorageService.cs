using Amazon.S3;
using Amazon.S3.Transfer;

namespace BDMS;

/// <summary>
/// Represent a cloud storage service for interacting with AWS S3.
/// </summary>
public class CloudStorageService
{
    public async Task<List<S3FileObject>> UploadToS3(List<IFormFile> files)
    {
        var bucketName = "your-bucket-name";
        var filePath = "path/to/your/file.ext";

        using AmazonS3Client s3Client = new AmazonS3Client();
        using TransferUtility fileTransferUtility = new TransferUtility(s3Client);

        var fileTransferUtilityRequest = new TransferUtilityUploadRequest
        {
            BucketName = bucketName,
            FilePath = filePath,
            Key = "destination/filename.ext",
        };

        var fileTransferUtility.Upload(fileTransferUtilityRequest);

        fileTransferUtility.

        return new List<S3FileObject>();
    }
}

public class S3FileObject
{
}
