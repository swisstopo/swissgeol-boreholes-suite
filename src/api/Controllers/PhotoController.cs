using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class PhotoController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly ILogger logger;
    private readonly IBoreholeLockService boreholeLockService;

    public PhotoController(BdmsContext context, ILogger<PhotoController> logger, IBoreholeLockService boreholeLockService)
    {
        this.context = context;
        this.logger = logger;
        this.boreholeLockService = boreholeLockService;
    }

    /// <summary>
    /// Get all <see cref="Photo"/> that are linked to the <see cref="Borehole"/> with <see cref="Borehole.Id"/> provided in <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the <see cref="Borehole"/>.</param>
    /// <returns>A list of <see cref="Photo"/>.</returns>
    [HttpGet("getAllForBorehole")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<Photo>>> GetAllOfBorehole([Required, Range(1, int.MaxValue)] int boreholeId)
    {
        if (boreholeId == 0) return BadRequest("No boreholeId provided.");

        if (!await boreholeLockService.HasUserWorkgroupPermissionsAsync(boreholeId, HttpContext.GetUserSubjectId()).ConfigureAwait(false)) return Unauthorized();

        // Get all photos that are linked to the borehole.
        return await context.Photos
            .Include(bp => bp.CreatedBy)
            .Where(bp => bp.BoreholeId == boreholeId)
            .AsNoTracking()
            .ToListAsync()
            .ConfigureAwait(false);
    }
}
