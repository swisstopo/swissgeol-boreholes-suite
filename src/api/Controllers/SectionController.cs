using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class SectionController : BoreholeControllerBase<Section>
{
    public SectionController(BdmsContext context, ILogger<SectionController> logger, IBoreholePermissionService boreholePermissionService)
        : base(context, logger, boreholePermissionService)
    {
    }

    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<Section>> GetAsync([FromQuery] int? boreholeId = null)
    {
        var sections = Context.Sections
            .Include(s => s.SectionElements)
            .AsNoTracking();

        if (boreholeId != null)
        {
            sections = sections.Where(s => s.BoreholeId == boreholeId);
        }

        return await sections.OrderBy(s => s.Name).ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Section"/> with the specified <paramref name="id"/>.
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<Section>> GetByIdAsync(int id)
    {
        var section = await Context.Sections
            .Include(c => c.SectionElements)
            .AsNoTracking()
            .SingleOrDefaultAsync(i => i.Id == id)
            .ConfigureAwait(false);

        if (section == null)
        {
            return NotFound();
        }

        return Ok(section);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<Section>> CreateAsync(Section entity)
    {
        if (entity == null) return BadRequest();

        try
        {
            if (!(entity.SectionElements?.Count > 0))
            {
                var message = "At least one section element must be defined.";
                Logger.LogWarning(message);
                return Problem(message);
            }

            return await base.CreateAsync(entity).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            var message = "An error ocurred while creating the section.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<Section>> EditAsync(Section entity)
    {
        if (entity == null) return BadRequest();

        try
        {
            // Check if associated borehole is locked
            var boreholeId = await GetBoreholeId(entity).ConfigureAwait(false);
            if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false))
            {
                return Problem("The borehole is locked by another user or you are missing permissions.");
            }

            if (!(entity.SectionElements?.Count > 0))
            {
                var message = "At least one section element must be defined.";
                Logger.LogWarning(message);
                return Problem(message);
            }

            var existingEntity = await Context.Sections.Include(c => c.SectionElements).SingleOrDefaultAsync(c => c.Id == entity.Id).ConfigureAwait(false);
            if (existingEntity == null)
            {
                return NotFound();
            }

            Context.Entry(existingEntity).CurrentValues.SetValues(entity);
            existingEntity.SectionElements = entity.SectionElements;

            await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
            return Ok(entity);
        }
        catch (Exception ex)
        {
            var message = "An error occurred while updating the section.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<IActionResult> DeleteAsync(int id)
    {
        try
        {
            var section = await Context.Sections
                .Include(c => c.SectionElements)
                .AsNoTracking()
                .SingleOrDefaultAsync(i => i.Id == id)
                .ConfigureAwait(false);

            if (section == null)
            {
                return NotFound();
            }

            // Check if associated borehole is locked
            var boreholeId = await GetBoreholeId(section).ConfigureAwait(false);
            if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false))
            {
                return Problem("The borehole is locked by another user or you are missing permissions.");
            }

            Context.Remove(section);
            await Context.SaveChangesAsync().ConfigureAwait(false);
            return Ok();
        }
        catch (Exception ex)
        {
            var message = "An error ocurred while deleting the section.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }

    /// <inheritdoc />
    protected override Task<int?> GetBoreholeId(Section entity)
    {
        if (entity == null) return Task.FromResult<int?>(default);

        return Task.FromResult<int?>(entity.BoreholeId);
    }
}
