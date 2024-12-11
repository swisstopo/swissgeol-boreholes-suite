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
    private readonly IBoreholeLockService boreholeLockService;
    private static readonly List<IBoreholeGeometryFormat> geometryFormats = new()
    {
        new XYZFormat(),
        new AzIncFormat(),
        new PitchRollFormat(),
    };

    public BoreholeGeometryController(BdmsContext context, ILogger<BoreholeGeometryElement> logger, IBoreholeLockService boreholeLockService)
    {
        this.context = context;
        this.logger = logger;
        this.boreholeLockService = boreholeLockService;
    }

    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<BoreholeGeometryElement>> GetAsync([FromQuery] int boreholeId)
    {
        return await GetBoreholeGeometry(boreholeId).ConfigureAwait(false);
    }

    [HttpDelete]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> DeleteAsync(int boreholeId)
    {
        // Check if associated borehole is locked
        if (await boreholeLockService.IsBoreholeLockedAsync(boreholeId, HttpContext.GetUserSubjectId()).ConfigureAwait(false))
        {
            return Problem("The borehole is locked by another user or you are missing permissions.", statusCode: (int)HttpStatusCode.BadRequest);
        }

        context.BoreholeGeometry.RemoveRange(context.BoreholeGeometry.Where(g => g.BoreholeId == boreholeId));
        await context.SaveChangesAsync().ConfigureAwait(false);
        return Ok();
    }

    [HttpGet("[action]")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public IActionResult GeometryFormats()
    {
        return Ok(geometryFormats
            .Select(f => new { f.Name, f.Key, f.CsvHeader })
            .ToList());
    }

    [HttpPost]
    [Authorize(Policy = PolicyNames.Viewer)]
    [RequestSizeLimit(int.MaxValue)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxFileSize)]
    public async Task<IActionResult> UploadBoreholeGeometry(int boreholeId, IFormFile geometryFile, [FromForm] string geometryFormat)
    {
        // Check if associated borehole is locked
        if (await boreholeLockService.IsBoreholeLockedAsync(boreholeId, HttpContext.GetUserSubjectId()).ConfigureAwait(false))
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

    [HttpGet("[action]")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> GetDepthTVD([FromQuery] int boreholeId, [FromQuery] double depthMD)
    {
        var geometry = await GetBoreholeGeometry(boreholeId).ConfigureAwait(false);

        var tvd = GetTVDIfGeometryExists(depthMD, geometry);
        if (tvd != null)
        {
            return Ok(tvd);
        }

        logger?.LogInformation($"Invalid input, could not calculate true vertical depth from measured depth of {depthMD}");
        return Ok();
    }

    internal static double? GetTVDIfGeometryExists(double? depthMD, List<BoreholeGeometryElement> geometry)
    {
        if (geometry.Count < 2)
        {
            if (depthMD != null && depthMD >= 0)
            {
                // Return the depthMD unchanged as if the borehole is perfectly vertical and infinitely long.
                return depthMD;
            }
        }
        else if (depthMD != null)
        {
            try
            {
                return geometry.GetDepthTVD(depthMD.Value);
            }
            catch (ArgumentOutOfRangeException)
            {
                // Exception is ignored so that the action returns an empty response in case the input was invalid.
            }
        }

        return null;
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
