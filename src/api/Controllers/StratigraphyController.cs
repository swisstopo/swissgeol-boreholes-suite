﻿using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class StratigraphyController : BdmsControllerBase<Stratigraphy>
{
    private readonly IBoreholeLockService boreholeLockService;

    public StratigraphyController(BdmsContext context, ILogger<Stratigraphy> logger, IBoreholeLockService boreholeLockService)
        : base(context, logger)
    {
        this.boreholeLockService = boreholeLockService;
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Stratigraphy"/> with the specified <paramref name="id"/>.
    /// </summary>
    /// <param name="id">The id of the  <see cref="Stratigraphy"/> to get.</param>
    [HttpGet("{id}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<Stratigraphy>> GetByIdAsync([Required] int id)
    {
        var stratigraphy = await Context.Stratigraphies
            .SingleOrDefaultAsync(x => x.Id == id)
            .ConfigureAwait(false);

        if (stratigraphy == null)
        {
            return NotFound();
        }

        return Ok(stratigraphy);
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Stratigraphy"/>s, optionally filtered by <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the borehole containing the stratigraphies to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<Stratigraphy>> GetAsync([FromQuery] int? boreholeId = null)
    {
        var stratigraphies = Context.Stratigraphies.AsNoTracking();
        if (boreholeId != null)
        {
            stratigraphies = stratigraphies.Where(l => l.BoreholeId == boreholeId);
        }

        return await stratigraphies.ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously copies a <see cref="Stratigraphy"/>.
    /// </summary>
    /// <param name="id">The <see cref="Stratigraphy.Id"/> of the stratigraphy to copy.</param>
    /// <returns>The id of the newly created <see cref="Stratigraphy"/>.</returns>
    [HttpPost("copy")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<int>> CopyAsync([Required] int id)
    {
        Logger.LogInformation("Copy stratigraphy with id <{StratigraphyId}>", id);

        var user = await Context.Users
            .Include(u => u.WorkgroupRoles)
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.SubjectId == HttpContext.GetUserSubjectId())
            .ConfigureAwait(false);

        if (user == null || !user.WorkgroupRoles.Any(w => w.Role == Role.Editor))
        {
            return Unauthorized();
        }

        var stratigraphy = await Context.Stratigraphies
            .Include(s => s.Layers).ThenInclude(l => l.LayerColorCodes)
            .Include(s => s.Layers).ThenInclude(l => l.LayerDebrisCodes)
            .Include(s => s.Layers).ThenInclude(l => l.LayerGrainAngularityCodes)
            .Include(s => s.Layers).ThenInclude(l => l.LayerGrainShapeCodes)
            .Include(s => s.Layers).ThenInclude(l => l.LayerOrganicComponentCodes)
            .Include(s => s.Layers).ThenInclude(l => l.LayerUscs3Codes)
            .Include(s => s.LithologicalDescriptions)
            .Include(s => s.FaciesDescriptions)
            .Include(s => s.ChronostratigraphyLayers)
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == id)
            .ConfigureAwait(false);

        if (stratigraphy == null)
        {
            return NotFound();
        }

        // Set ids of copied entities to zero. Entities with an id of zero are added as new entities to the DB.
        stratigraphy.Id = 0;

        foreach (var layer in stratigraphy.Layers)
        {
            layer.Id = 0;
            layer.LayerColorCodes?.ResetLayerIds();
            layer.LayerDebrisCodes?.ResetLayerIds();
            layer.LayerGrainShapeCodes?.ResetLayerIds();
            layer.LayerGrainAngularityCodes?.ResetLayerIds();
            layer.LayerOrganicComponentCodes?.ResetLayerIds();
            layer.LayerUscs3Codes?.ResetLayerIds();
        }

        foreach (var lithologicalDescription in stratigraphy.LithologicalDescriptions)
        {
            lithologicalDescription.Id = 0;
        }

        foreach (var faciesDescription in stratigraphy.FaciesDescriptions)
        {
            faciesDescription.Id = 0;
        }

        foreach (var chronostratigraphy in stratigraphy.ChronostratigraphyLayers)
        {
            chronostratigraphy.Id = 0;
        }

        stratigraphy.Name += " (Clone)";
        stratigraphy.IsPrimary = false;

        var entityEntry = await Context.AddAsync(stratigraphy).ConfigureAwait(false);
        await Context.SaveChangesAsync().ConfigureAwait(false);

        return Ok(entityEntry.Entity.Id);
    }

    private void ResetLayerIds(IEnumerable<ILayerCode> layerCodes)
    {
        foreach (var layerCode in layerCodes)
        {
            layerCode.LayerId = 0;
        }
    }

    /// <inheritdoc />
    /// <remarks>Automatically sets the remaining and latest stratigraphy as the primary stratigraphy, if possible.</remarks>
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<IActionResult> DeleteAsync(int id)
    {
        var stratigraphyToDelete = await Context.Stratigraphies.FindAsync(id).ConfigureAwait(false);
        if (stratigraphyToDelete == null)
        {
            return NotFound();
        }

        Context.Remove(stratigraphyToDelete);
        await Context.SaveChangesAsync().ConfigureAwait(false);

        // If the stratigraphy to delete is the primary stratigraphy of a borehole,
        // then we need to set the latest stratigraphy as the primary stratigraphy, if possible.
        if (stratigraphyToDelete.IsPrimary.GetValueOrDefault())
        {
            var latestStratigraphy = await Context.Stratigraphies
                .Where(s => s.BoreholeId == stratigraphyToDelete.BoreholeId)
                .OrderByDescending(s => s.Created)
                .FirstOrDefaultAsync()
                .ConfigureAwait(false);

            if (latestStratigraphy != null)
            {
                latestStratigraphy.IsPrimary = true;
                Context.Update(latestStratigraphy);
                await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
            }
        }

        return Ok();
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<Stratigraphy>> CreateAsync(Stratigraphy entity)
    {
        if (entity == null) return BadRequest(ModelState);

        try
        {
            // Check if associated borehole is locked
            if (await boreholeLockService.IsBoreholeLockedAsync(entity.BoreholeId, HttpContext.GetUserSubjectId()).ConfigureAwait(false))
            {
                return Problem("The borehole is locked by another user or you are missing permissions.");
            }

            // If the stratigraphy to create is the first stratigraphy of a borehole,
            // then we need to set it as the primary stratigraphy.
            var hasBoreholeExistingStratigraphy = await Context.Stratigraphies
                .AnyAsync(s => s.BoreholeId == entity.BoreholeId)
                .ConfigureAwait(false);

            entity.IsPrimary = !hasBoreholeExistingStratigraphy;

            return await base.CreateAsync(entity).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            var message = "An error ocurred while creating the stratigraphy.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }

    /// <summary>
    /// Asynchronously adds a bedrock <see cref="Layer"/> to a <see cref="Stratigraphy"/>.
    /// </summary>
    /// <param name="id">The <see cref="Stratigraphy"/> id.</param>
    /// <returns>The id of the created bedrock <see cref="Layer"/>.</returns>
    [HttpPost("addbedrock")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<int>> AddBedrockLayerAsync([Required] int id)
    {
        var stratigraphy = await Context.Stratigraphies.FindAsync(id).ConfigureAwait(false);
        if (stratigraphy == null)
        {
            return NotFound();
        }

        try
        {
            // Check if associated borehole is locked
            if (await boreholeLockService.IsBoreholeLockedAsync(stratigraphy.BoreholeId, HttpContext.GetUserSubjectId()).ConfigureAwait(false))
            {
                return Problem("The borehole is locked by another user or you are missing permissions.");
            }

            // Check if associated borehole has a TopBedrock value
            var borehole = await Context.Boreholes.FindAsync(stratigraphy.BoreholeId).ConfigureAwait(false);
            if (!borehole.TopBedrock.HasValue)
            {
                return Problem("Bedrock not yet defined.");
            }

            // Add bedrock layer
            var bedrockLayer = new Layer
            {
                StratigraphyId = stratigraphy.Id,
                FromDepth = borehole.TopBedrock.Value,
                LithologyTopBedrockId = borehole.LithologyTopBedrockId,
                LithostratigraphyId = borehole.LithostratigraphyId,
                IsLast = false,
            };

            await Context.Layers.AddAsync(bedrockLayer).ConfigureAwait(false);
            await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);

            return Ok(bedrockLayer.Id);
        }
        catch (Exception ex)
        {
            var message = "An error ocurred while adding a bedrock layer to the stratigraphy.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<Stratigraphy>> EditAsync(Stratigraphy entity)
    {
        try
        {
            // Check if associated borehole is locked
            if (await boreholeLockService.IsBoreholeLockedAsync(entity.BoreholeId, HttpContext.GetUserSubjectId()).ConfigureAwait(false))
            {
                return Problem("The borehole is locked by another user or you are missing permissions.");
            }

            var editResult = await base.EditAsync(entity).ConfigureAwait(false);
            if (editResult.Result is not OkObjectResult) return editResult;

            // If the stratigraphy to edit is the primary stratigraphy,
            // then reset any other primary stratigraphies of the borehole.
            if (entity.IsPrimary.GetValueOrDefault())
            {
                var otherPrimaryStratigraphies = await Context.Stratigraphies
                    .Where(s => s.BoreholeId == entity.BoreholeId && s.IsPrimary == true && s.Id != entity.Id)
                    .ToListAsync()
                    .ConfigureAwait(false);

                foreach (var other in otherPrimaryStratigraphies)
                {
                    other.IsPrimary = false;
                    Context.Update(other);
                }

                await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
            }

            return editResult;
        }
        catch (Exception ex)
        {
            var message = "An error ocurred while editing the stratigraphy.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }
}
