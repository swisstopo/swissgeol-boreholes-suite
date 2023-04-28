﻿using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class BoreholeFileController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly BoreholeFileUploadService boreholeFileUploadService;
    private readonly ILogger logger;

    public BoreholeFileController(BdmsContext context, ILogger<BoreholeFileController> logger, BoreholeFileUploadService boreholeFileUploadService)
        : base()
    {
        this.logger = logger;
        this.boreholeFileUploadService = boreholeFileUploadService;
        this.context = context;
    }

    /// <summary>
    /// Uploads a file to the cloud storage and links it to the borehole.
    /// </summary>
    /// <param name="file">The file to upload and link to the <see cref="Borehole"/>.</param>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> to link the uploaded <paramref name="file"/> to.</param>
    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file, [Range(1, int.MaxValue)] int boreholeId)
    {
        if (file == null || file.Length == 0) return BadRequest("No file provided.");
        if (boreholeId == 0) return BadRequest("No boreholeId provided.");

        try
        {
            await boreholeFileUploadService.UploadFileAndLinkToBorehole(file, boreholeId).ConfigureAwait(false);
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while uploading the file.");
            return Problem("An error occurred while uploading the file.");
        }
    }

    /// <summary>
    /// Downloads a file from the cloud storage.
    /// </summary>
    /// <param name="boreholeFileId">The <see cref="BoreholeFile.FileId"/> of the file to download.</param>
    /// <returns>The stream of the downloaded file.</returns>
    [HttpGet("download")]
    public async Task<IActionResult> Download([Range(1, int.MaxValue)] int boreholeFileId)
    {
        if (boreholeFileId == 0) return BadRequest("No boreholeFileId provided.");

        try
        {
            var boreholeFile = await context.BoreholeFiles
                .Include(f => f.File)
                .FirstOrDefaultAsync(f => f.FileId == boreholeFileId)
                .ConfigureAwait(false);

            if (boreholeFile?.File?.NameUuid == null) return NotFound($"File with id {boreholeFileId} not found.");

            var fileBytes = await boreholeFileUploadService.GetObject(boreholeFile.File.NameUuid).ConfigureAwait(false);

            return File(fileBytes, "application/octet-stream", boreholeFile.File.Name);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while downloading the file.");
            return Problem("An error occurred while downloading the file.");
        }
    }

    /// <summary>
    /// Get all <see cref="BoreholeFile"/> that are linked to the <see cref="Borehole"/> with <see cref="Borehole.Id"/> provided in <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the <see cref="Borehole"/>.</param>
    /// <returns>A list of <see cref="BoreholeFile"/>.</returns>
    [HttpGet("getAllForBorehole")]
    public async Task<ActionResult<IEnumerable<BoreholeFile>>> GetAllOfBorehole([Required, Range(1, int.MaxValue)] int boreholeId)
    {
        if (boreholeId == 0) return BadRequest("No boreholeId provided.");

        // Get all BoreholeFiles that are linked to the borehole.
        // Do not use .Include(bf => bf.File) here, as it will cause a object cycling.
        var boreholeFiles = await context.BoreholeFiles
            .Include(bf => bf.User)
            .Where(bf => bf.BoreholeId == boreholeId)
            .AsNoTracking()
            .ToListAsync()
            .ConfigureAwait(false);

        var fileIds = boreholeFiles.Select(bf => bf.FileId).ToList();

        // Get all files refred as borehole files.
        // Do not use .Include(f => f.BoreholeFiles) here, as it will cause a object cycling.
        var files = await context.Files
            .Where(f => fileIds.Any(id => id == f.Id))
            .AsNoTracking()
            .ToListAsync()
            .ConfigureAwait(false);

        // Set the File property of the BoreholeFile.
        foreach (var boreholeFile in boreholeFiles)
        {
            boreholeFile.File = files.FirstOrDefault(f => f.Id == boreholeFile.FileId) ?? new Models.File();
        }

        return boreholeFiles;
    }

    /// <summary>
    /// Detaches a <see cref="BoreholeFile"/> from the <see cref="Borehole"/> with <see cref="Borehole.Id"/> provided in <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> of the borehole to detach the file from.</param>
    /// <param name="boreholeFileId">The <see cref="BoreholeFile.FileId"/> of the file to detach from the borehole.</param>
    [HttpPost("detachFile")]
    public async Task<IActionResult> DetachFromBorehole([Required, Range(1, int.MaxValue)] int boreholeId, [Range(1, int.MaxValue)] int boreholeFileId)
    {
        if (boreholeId == 0) return BadRequest("No boreholeId provided.");
        if (boreholeFileId == 0) return BadRequest("No boreholeFileId provided.");

        try
        {
            // Get the file and its BoreholeFiles from the database.
            var boreholeFile = await context.BoreholeFiles.Include(f => f.File).FirstOrDefaultAsync(f => f.FileId == boreholeFileId).ConfigureAwait(false);

            if (boreholeFile == null) return NotFound();

            var fileId = boreholeFile.File.Id;

            // Remove the requested boreholeFile from the database.
            context.BoreholeFiles.Remove(boreholeFile);
            await context.SaveChangesAsync().ConfigureAwait(false);

            var file = await context.Files.FirstOrDefaultAsync(f => f.Id == fileId).ConfigureAwait(false);

            // If the file is not linked to any boreholes, delete it from the cloud storage and the database.
            if (file?.NameUuid != null && file.BoreholeFiles.Count == 0)
            {
                await boreholeFileUploadService.DeleteObject(file.NameUuid).ConfigureAwait(false);
                context.Files.Remove(file);
                await context.SaveChangesAsync().ConfigureAwait(false);
            }

            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while detaching the file.");
            return Problem("An error occurred while detaching the file.");
        }
    }

    /// <summary>
    /// Update the <see cref="BoreholeFile"/> with the provided <paramref name="boreholeId"/> and <paramref name="boreholeFileId"/>.
    /// </summary>
    /// <param name="boreholeFileUpdate">The updated <see cref="BoreholeFileUpdate"/> object containing the new <see cref="BoreholeFile"/> properties.</param>
    /// <param name="boreholeId">The id of the <see cref="Borehole"/> to which the <see cref="BoreholeFile"/> is linked to.</param>
    /// <param name="boreholeFileId">The id of the <see cref="BoreholeFile"/> to update.</param>
    /// <remarks>
    /// Only the <see cref="BoreholeFile.Public"/> and <see cref="BoreholeFile.Description"/> properties can be updated.
    /// </remarks>
    [HttpPut("update")]
    public async Task<IActionResult> Update([FromBody] BoreholeFileUpdate boreholeFileUpdate, [Required, Range(1, int.MaxValue)] int boreholeId, [Range(1, int.MaxValue)] int boreholeFileId)
    {
        if (boreholeFileUpdate == null || boreholeId == 0 || boreholeFileId == 0)
        {
            return BadRequest("Invalid borehole file object provided.");
        }

        var existingBoreholeFile = await context.BoreholeFiles
            .FirstOrDefaultAsync(bf => bf.FileId == boreholeFileId && bf.BoreholeId == boreholeId)
            .ConfigureAwait(false);

        if (existingBoreholeFile == null)
        {
            return NotFound("Borehole file not found.");
        }

        existingBoreholeFile.Public = boreholeFileUpdate.Public;
        existingBoreholeFile.Description = boreholeFileUpdate.Description;

        context.Entry(existingBoreholeFile).State = EntityState.Modified;
        await context.SaveChangesAsync().ConfigureAwait(false);

        return Ok();
    }
}
