using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class StratigraphyController : BoreholeControllerBase<Stratigraphy>
{
    public StratigraphyController(BdmsContext context, ILogger<StratigraphyController> logger, IBoreholePermissionService boreholePermissionService)
        : base(context, logger, boreholePermissionService)
    {
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Stratigraphy"/>s, filtered by <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the borehole containing the stratigraphies to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<Stratigraphy>>> GetAsync([FromQuery] int boreholeId)
    {
        var borehole = await Context.Boreholes
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == boreholeId)
            .ConfigureAwait(false);

        if (borehole == null)
        {
            return NotFound();
        }

        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        var stratigraphies = await Context.Stratigraphies
            .AsNoTracking()
            .Where(x => x.BoreholeId == boreholeId)
            .ToListAsync()
            .ConfigureAwait(false);

        return Ok(stratigraphies);
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
        try
        {
            var stratigraphy = await Context.StratigraphiesWithIncludes
                .AsNoTracking()
                .SingleOrDefaultAsync(b => b.Id == id)
                .ConfigureAwait(false);

            if (stratigraphy == null)
            {
                return NotFound();
            }

            if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), stratigraphy.BoreholeId).ConfigureAwait(false)) return Unauthorized();

            // Set ids of copied entities to zero. Entities with an id of zero are added as new entities to the DB.
            stratigraphy.Id = 0;
            stratigraphy.Name = string.IsNullOrEmpty(stratigraphy.Name) ? "(Clone)" : $"{stratigraphy.Name} (Clone)";
            stratigraphy.IsPrimary = false;

            foreach (var lithology in stratigraphy.Lithologies)
            {
                lithology.Id = 0;
                lithology.LithologyRockConditionCodes?.ResetLithologyIds();
                lithology.LithologyUscsTypeCodes?.ResetLithologyIds();
                lithology.LithologyTextureMetaCodes?.ResetLithologyIds();

                foreach (var description in lithology.LithologyDescriptions)
                {
                    description.Id = 0;
                    description.LithologyDescriptionComponentUnconOrganicCodes?.ResetLithologyDescriptionIds();
                    description.LithologyDescriptionComponentUnconDebrisCodes?.ResetLithologyDescriptionIds();
                    description.LithologyDescriptionGrainShapeCodes?.ResetLithologyDescriptionIds();
                    description.LithologyDescriptionGrainAngularityCodes?.ResetLithologyDescriptionIds();
                    description.LithologyDescriptionLithologyUnconDebrisCodes?.ResetLithologyDescriptionIds();
                    description.LithologyDescriptionComponentConParticleCodes?.ResetLithologyDescriptionIds();
                    description.LithologyDescriptionComponentConMineralCodes?.ResetLithologyDescriptionIds();
                    description.LithologyDescriptionStructureSynGenCodes?.ResetLithologyDescriptionIds();
                    description.LithologyDescriptionStructurePostGenCodes?.ResetLithologyDescriptionIds();
                }
            }

            stratigraphy.LithologicalDescriptions?.MarkAsNew();
            stratigraphy.FaciesDescriptions?.MarkAsNew();
            stratigraphy.ChronostratigraphyLayers?.MarkAsNew();
            stratigraphy.LithostratigraphyLayers?.MarkAsNew();

            var entityEntry = await Context.AddAsync(stratigraphy).ConfigureAwait(false);
            await Context.SaveChangesAsync().ConfigureAwait(false);

            return Ok(entityEntry.Entity.Id);
        }
        catch (Exception ex)
        {
            var message = "An error occurred while copying the stratigraphy.";
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
            var stratigraphyToDelete = await Context.Stratigraphies.FindAsync(id).ConfigureAwait(false);
            if (stratigraphyToDelete == null)
            {
                return NotFound();
            }

            if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), stratigraphyToDelete.BoreholeId).ConfigureAwait(false)) return Unauthorized();

            var existingStratigraphyCount = await Context.Stratigraphies
                .CountAsync(s => s.BoreholeId == stratigraphyToDelete.BoreholeId)
                .ConfigureAwait(false);

            if (existingStratigraphyCount > 1 && stratigraphyToDelete.IsPrimary)
            {
                return Problem("Main stratigraphy cannot be deleted.");
            }

            Context.Remove(stratigraphyToDelete);
            await Context.SaveChangesAsync().ConfigureAwait(false);

            return Ok();
        }
        catch (Exception ex)
        {
            var message = "An error occurred while deleting the stratigraphy.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<Stratigraphy>> CreateAsync(Stratigraphy entity)
    {
        try
        {
            if (entity == null) return BadRequest();

            if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), entity.BoreholeId).ConfigureAwait(false)) return Unauthorized();

            if (!await IsNameUnique(entity).ConfigureAwait(false))
            {
                return NameMustBeUniqueProblem();
            }

            // If the stratigraphy to create is the first stratigraphy of a borehole,
            // then we need to set it as the primary stratigraphy.
            var hasBoreholeExistingStratigraphy = await Context.Stratigraphies
                .AnyAsync(s => s.BoreholeId == entity.BoreholeId)
                .ConfigureAwait(false);

            if (!hasBoreholeExistingStratigraphy)
            {
                entity.IsPrimary = true;
            }
            else if (entity.IsPrimary)
            {
                await ResetOtherPrimaryStratigraphiesAsync(entity).ConfigureAwait(false);
            }

            return await base.CreateAsync(entity).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            var message = "An error ocurred while creating the stratigraphy.";
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
            if (entity == null) return BadRequest();

            if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), entity.BoreholeId).ConfigureAwait(false)) return Unauthorized();

            if (!await IsNameUnique(entity).ConfigureAwait(false))
            {
                return NameMustBeUniqueProblem();
            }

            entity.Date = entity.Date != null ? DateTime.SpecifyKind(entity.Date.Value, DateTimeKind.Utc) : null;
            var editResult = await base.EditAsync(entity).ConfigureAwait(false);
            if (editResult.Result is not OkObjectResult) return editResult;

            if (entity.IsPrimary)
            {
                await ResetOtherPrimaryStratigraphiesAsync(entity).ConfigureAwait(false);
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

    /// <inheritdoc />
    protected override Task<int?> GetBoreholeId(Stratigraphy entity)
    {
        if (entity == null) return Task.FromResult<int?>(default);

        return Task.FromResult<int?>(entity.BoreholeId);
    }

    private async Task ResetOtherPrimaryStratigraphiesAsync(Stratigraphy entity)
    {
        var otherPrimaryStratigraphies = await Context.Stratigraphies
            .Where(s => s.BoreholeId == entity.BoreholeId && s.IsPrimary && s.Id != entity.Id)
            .ToListAsync()
            .ConfigureAwait(false);

        foreach (var other in otherPrimaryStratigraphies)
        {
            other.IsPrimary = false;
            Context.Update(other);
        }

        await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
    }

    private ObjectResult NameMustBeUniqueProblem()
    {
        var result = (ObjectResult)Problem(detail: "Name must be unique", type: ProblemType.UserError);
        ((ProblemDetails)result.Value!).Extensions["messageKey"] = "mustBeUnique";
        return result;
    }

    private async Task<bool> IsNameUnique(Stratigraphy entity)
    {
        if (string.IsNullOrEmpty(entity.Name))
        {
            return true;
        }

        var hasBoreholeStratigraphiesWithSameName = await Context.Stratigraphies
                .AnyAsync(s => s.BoreholeId == entity.BoreholeId && s.Id != entity.Id && s.Name == entity.Name)
                .ConfigureAwait(false);

        return !hasBoreholeStratigraphiesWithSameName;
    }
}
