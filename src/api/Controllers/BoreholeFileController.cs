using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class BoreholeFileController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly CloudStorageService storageService;

    public BoreholeFileController(BdmsContext context, CloudStorageService storageService)
        : base()
    {
        this.storageService = storageService;
        this.context = context;
    }

    /// <summary>
    /// Uploads a file to the cloud storage and links it to the borehole.
    /// </summary>
    /// <param name="file">The file to upload and link to the <see cref="Borehole"/>.</param>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> to link the uploaded <paramref name="file"/> to.</param>
    [HttpPost("upload")]
    public async Task<ActionResult> Upload(IFormFile file, int boreholeId)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("File is not selected");
        }

        // Generate a hash based on the file content.
        var base64Hash = GetSha256HashOfString(file);

        // Check any file with the same hash already exists in the database.
        var bdmsFileId = context.Files.FirstOrDefault(f => f.Hash == base64Hash)?.Id;

        // Create a transaction to ensure the file is only linked to the borehole if it is successfully uploaded.
        using var transaction = context.Database.BeginTransaction();
        try
        {
            // If the file already exists, link it to the borehole.
            if (bdmsFileId == null)
            {
                var fileExtension = Path.GetExtension(file.FileName);
                var fileNameGuid = $"{Guid.NewGuid()}{fileExtension}";

                var bdmsFile = new BDMS.Models.File
                {
                    Name = file.FileName,
                    NameUuid = fileNameGuid,
                    Hash = base64Hash,
                    Type = file.ContentType,
                };

                await context.Files.AddAsync(bdmsFile).ConfigureAwait(false);

                await context.SaveChangesAsync().ConfigureAwait(false);

                bdmsFileId = bdmsFile.Id;

                // Upload the file to the cloud storage.
                await storageService.UploadObject(file, fileNameGuid).ConfigureAwait(false);
            }

            if (!context.BoreholeFiles.Any(bf => bf.BoreholeId == boreholeId && bf.FileId == bdmsFileId))
            {
                // Create new BoreholeFile
                var boreHoleFile = new BoreholeFile
                {
                    FileId = (int)bdmsFileId,
                    BoreholeId = boreholeId,
                };
                await context.BoreholeFiles.AddAsync(boreHoleFile).ConfigureAwait(false);
                context.BoreholeFiles.Add(boreHoleFile);

                await context.SaveChangesAsync().ConfigureAwait(false);
            }

            transaction.Commit();
            return Ok();
        }
        catch
        {
            return Problem("An error occurred while uploading the file.");
        }
    }

    /// <summary>
    /// Downloads a file from the cloud storage.
    /// </summary>
    /// <param name="boreholeFileId">The <see cref="BoreholeFile.FileId"/> of the file to download.</param>
    /// <returns>The stream of the downloaded file.</returns>
    [HttpGet("download")]
    public async Task<IActionResult> Download(int boreholeFileId)
    {
        try
        {
            var file = await context.Files
                .Include(f => f.BoreholeFiles)
                .Where(f => f.BoreholeFiles.Any(bf => bf.FileId == boreholeFileId))
                .FirstOrDefaultAsync()
                .ConfigureAwait(false);

            if (file?.NameUuid == null)
            {
                return NotFound($"File with ID {boreholeFileId} not found in borehole.");
            }

            var fileBytes = await storageService.GetObject(file.NameUuid).ConfigureAwait(false);

            return File(fileBytes, "application/octet-stream", file.Name);
        }
        catch (Exception ex)
        {
            // Handle exceptions here
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    /// <summary>
    /// Get all <see cref="BoreholeFile"/> that are linked to the <see cref="Borehole"/> with <see cref="Borehole.Id"/> provided in <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId"></param>
    /// <returns>A list of <see cref="BoreholeFile"/>.</returns>
    [HttpGet("getAllForBorehole")]
    public async Task<IEnumerable<BoreholeFile>> GetAllOfBorehole(int boreholeId)
    {
        return await context.BoreholeFiles
            .Where(bf => bf.BoreholeId == boreholeId)
            .ToListAsync()
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Detaches a <see cref="BoreholeFile"/> from the <see cref="Borehole"/> with <see cref="Borehole.Id"/> provided in <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> of the borehole to detach the file from.</param>
    /// <param name="boreholeFileId">The <see cref="BoreholeFile.FileId"/> of the file to detach from the borehole.</param>
    /// <returns>An IActionResult indicating the status of the operation.</returns>
    [HttpPost("detachFile")]
    public async Task<IActionResult> DetachFromBorehole(int boreholeId, int boreholeFileId)
    {
        try
        {
            var file = await context.Files
                .Include(b => b.BoreholeFiles)
                .FirstOrDefaultAsync(b => b.BoreholeFiles.Any(bf => bf.FileId == boreholeId))
                .ConfigureAwait(false);

            var borehole = await context.Boreholes
                .Include(b => b.BoreholeFiles)
                .FirstOrDefaultAsync(b => b.Id == boreholeId)
                .ConfigureAwait(false);

            if (borehole == null)
            {
                return NotFound($"Borehole with ID {boreholeId} not found.");
            }

            var boreholeFile = borehole.BoreholeFiles.FirstOrDefault(bf => bf.FileId == boreholeFileId);

            if (boreholeFile == null)
            {
                return NotFound($"File with ID {boreholeFileId} not found in borehole.");
            }

            borehole.BoreholeFiles.Remove(boreholeFile);
            await context.SaveChangesAsync().ConfigureAwait(false);

            return Ok($"File with ID {boreholeFileId} has been detached from borehole with ID {boreholeId}.");
        }
        catch (Exception ex)
        {
            // Handle exceptions here
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    /// <summary>
    /// Generates a SHA256 hash of the file content.
    /// </summary>
    /// <param name="file">The file to generate the hash for.</param>
    /// <returns>The hash as a base64 string.</returns>
    internal static string GetSha256HashOfString(IFormFile file)
    {
        var base64Hash = "";
        using (SHA256 sha256Hash = SHA256.Create())
        {
            using (Stream stream = file.OpenReadStream())
            {
                byte[] hashBytes = sha256Hash.ComputeHash(stream);
                base64Hash = Convert.ToBase64String(hashBytes);
            }
        }

        return base64Hash;
    }
}
