using BDMS.Authentication;
using BDMS.BoreholeGeometry;
using BDMS.Models;
using CsvHelper;
using CsvHelper.TypeConversion;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class BoreholeGeometryController : ControllerBase
{
    private const int MaxFileSize = 210_000_000; // 1024 x 1024 x 200 = 209715200 bytes
    private readonly BdmsContext context;
    private readonly ILogger logger;
    private readonly IBoreholePermissionService boreholePermissionService;
    private static readonly List<IBoreholeGeometryFormat> geometryFormats = new()
    {
        new XYZFormat(),
        new AzIncFormat(),
        new PitchRollFormat(),
    };

    public BoreholeGeometryController(BdmsContext context, ILogger<BoreholeGeometryElement> logger, IBoreholePermissionService boreholePermissionService)
    {
        this.context = context;
        this.logger = logger;
        this.boreholePermissionService = boreholePermissionService;
    }

    /// <summary>
    /// Get borehole geometry data for the provided borehole id.
    /// </summary>
    /// <param name="boreholeId">The id of the <see cref="Borehole"/> to get geometry data for.</param>"
    /// <returns>An IEnumerable of type <see cref="BoreholeGeometryElement"/>.</returns>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> GetAsync([FromQuery] int boreholeId)
    {
        if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        var result = await GetBoreholeGeometry(boreholeId).ConfigureAwait(false);
        return Ok(result);
    }

    /// <summary>
    /// Delete borehole geometry data for the provided borehole id.
    /// </summary>
    /// <param name="boreholeId">The id of the <see cref="Borehole"/> to delete geometry data for.</param>"
    [HttpDelete]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> DeleteAsync(int boreholeId)
    {
        // Check if associated borehole is locked
        if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false))
        {
            return Problem("The borehole is locked by another user or you are missing permissions.", statusCode: (int)HttpStatusCode.BadRequest);
        }

        context.BoreholeGeometry.RemoveRange(context.BoreholeGeometry.Where(g => g.BoreholeId == boreholeId));
        await context.SaveChangesAsync().ConfigureAwait(false);
        return Ok();
    }

    /// <summary>
    /// Get available geometry formats for borehole geometry data.
    /// </summary>
    /// <returns>A List of objects containing the format name, key, and CSV header.</returns>
    [HttpGet("[action]")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public IActionResult GeometryFormats()
    {
        return Ok(geometryFormats
            .Select(f => new { f.Name, f.Key, f.CsvHeader })
            .ToList());
    }

    /// <summary>
    /// Upload borehole geometry data to the database.
    /// </summary>
    /// <param name="boreholeId">The id of the <see cref="Borehole"/> to upload geometry data for.</param>
    /// <param name="geometryFile">The <see cref="IFormFile"/> containing the geometry data.</param>
    /// <param name="geometryFormat">The format of the geometry data.</param>
    [HttpPost]
    [Authorize(Policy = PolicyNames.Viewer)]
    [RequestSizeLimit(int.MaxValue)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxFileSize)]
    public async Task<IActionResult> UploadBoreholeGeometry(int boreholeId, IFormFile geometryFile, [FromForm] string geometryFormat)
    {
        // Check if associated borehole is locked
        if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false))
        {
            return Problem("The borehole is locked by another user or you are missing permissions.", statusCode: (int)HttpStatusCode.BadRequest);
        }

        var format = geometryFormats.SingleOrDefault(f => f.Key == geometryFormat);
        if (format == null)
        {
            return Problem("Invalid geometry format.", statusCode: (int)HttpStatusCode.BadRequest);
        }

        // Convert geometry data to BoreholeGeometry
        IList<BoreholeGeometryElement> boreholeGeometry;
        try
        {
            boreholeGeometry = format.ReadCsv(geometryFile, boreholeId);
        }
        catch (Exception ex) when (ex is HeaderValidationException || ex is ReaderException || ex is TypeConverterException)
        {
            logger?.LogError(ex, "BoreholeGeometry upload failed because of a CsvHelper exception");
            return Problem(ex.Message, statusCode: (int)HttpStatusCode.BadRequest);
        }

        // Delete existing geometry data of borehole
        context.BoreholeGeometry.RemoveRange(context.BoreholeGeometry.Where(g => g.BoreholeId == boreholeId));

        // Add new geometry data to database
        await context.BoreholeGeometry.AddRangeAsync(boreholeGeometry).ConfigureAwait(false);

        try
        {
            await context.SaveChangesAsync().ConfigureAwait(false);
            return Ok();
        }
        catch (Exception ex)
        {
            var errorMessage = "An error occurred while saving the borehole geometry.";
            logger?.LogError(ex, errorMessage);
            return Problem(errorMessage);
        }
    }

    /// <summary>
    /// Get the true vertical depth (TVD) from the borehole's geometry for the provided measured depth.
    /// </summary>
    /// <param name="boreholeId">The id of the <see cref="Borehole"/> to get the TVD for.</param>
    /// <param name="depthMD">The measured depth to get the TVD for.</param>
    /// <returns>The true vertical depth (TVD) in meters.</returns>
    [HttpGet("[action]")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> GetDepthTVD([FromQuery] int boreholeId, [FromQuery] double depthMD)
    {
        if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        var geometry = await GetBoreholeGeometry(boreholeId).ConfigureAwait(false);

        var tvd = geometry.ConvertBoreholeDepth(depthMD, BoreholeGeometryExtensions.GetDepthTVD);
        if (tvd == null)
        {
            logger.LogInformation("Invalid input, could not calculate true vertical depth from measured depth of {DepthMD}", depthMD);
        }

        return Ok(tvd);
    }

    /// <summary>
    /// Get the measured depth (MD) from the borehole's geometry for the provided true vertical depth (TVD).
    /// </summary>
    /// <param name="boreholeId">The id of the <see cref="Borehole"/> to get the MD for.</param>
    /// <param name="depthTvd">The true vertical depth to get the MD for.</param>
    /// <returns>The measured depth (MD) in meters.</returns>
    [HttpGet("[action]")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> GetDepthMD([FromQuery] int boreholeId, [FromQuery] double depthTvd)
    {
        if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        var geometry = await GetBoreholeGeometry(boreholeId).ConfigureAwait(false);

        var md = geometry.ConvertBoreholeDepth(depthTvd, BoreholeGeometryExtensions.GetDepthMD);
        if (md == null)
        {
            logger.LogInformation("Invalid input, could not calculate measured depth from true vertical depth of {DepthTVD}", depthTvd);
        }

        return Ok(md);
    }

    /// <summary>
    /// Get the depth in meters above sea level (MASL) from the borehole's reference elevation for the provided measured depth.
    /// </summary>
    /// <param name="boreholeId">The id of the <see cref="Borehole"/> to get the MASL for.</param>
    /// <param name="depthMD">The measured depth to get the MASL for.</param>
    /// <returns>The depth in meters above sea level (MASL).</returns>
    [HttpGet("[action]")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> GetDepthInMasl([FromQuery] int boreholeId, [FromQuery] double depthMD)
    {
        if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        var geometry = await GetBoreholeGeometry(boreholeId).ConfigureAwait(false);
        var tvd = geometry.ConvertBoreholeDepth(depthMD, BoreholeGeometryExtensions.GetDepthTVD);
        var borehole = await context.Boreholes.FindAsync(boreholeId).ConfigureAwait(false);

        if (tvd == null || borehole?.ReferenceElevation == null)
        {
            logger.LogInformation("Invalid input, could not calculate depth in MASL from measured depth of {DepthMD}", depthMD);
            return Ok(null);
        }

        return Ok(borehole.ReferenceElevation - tvd);
    }

    private async Task<List<BoreholeGeometryElement>> GetBoreholeGeometry(int boreholeId)
    {
        return await context.BoreholeGeometry
            .AsNoTracking()
            .Where(g => g.BoreholeId == boreholeId)
            .OrderBy(g => g.MD)
            .ToListAsync()
            .ConfigureAwait(false);
    }
}
