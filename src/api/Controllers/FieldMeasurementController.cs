using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class FieldMeasurementController : BoreholeControllerBase<FieldMeasurement>
{
    public FieldMeasurementController(BdmsContext context, ILogger<FieldMeasurementController> logger, IBoreholePermissionService boreholePermissionService)
        : base(context, logger, boreholePermissionService)
    {
    }

    /// <summary>
    /// Asynchronously gets all field measurement records optionally filtered by <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the borehole referenced in the observations to get.</param>
    /// <returns>An IEnumerable of type <see cref="FieldMeasurement"/>.</returns>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<FieldMeasurement>> GetAsync([FromQuery] int? boreholeId = null)
    {
        var user = await Context.UsersWithIncludes
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.SubjectId == HttpContext.GetUserSubjectId())
            .ConfigureAwait(false);

        var fieldMeasurements = Context.FieldMeasurements
            .Include(f => f.FieldMeasurementResults).ThenInclude(f => f.SampleType)
            .Include(f => f.FieldMeasurementResults).ThenInclude(f => f.Parameter)
            .Include(f => f.Reliability)
            .Include(f => f.Casing)
            .ThenInclude(c => c.Completion)
            .AsNoTracking();

        if (!user.IsAdmin)
        {
            var allowedWorkgroupIds = user.WorkgroupRoles.Select(w => w.WorkgroupId).ToList();
            fieldMeasurements = fieldMeasurements
                .Where(f=> Context.Boreholes
                .Where(b => b.WorkgroupId.HasValue)
                .Any(b => b.Id == f.BoreholeId && allowedWorkgroupIds
                .Contains(b.WorkgroupId!.Value)));
        }

        if (boreholeId != null)
        {
            fieldMeasurements = fieldMeasurements.Where(f => f.BoreholeId == boreholeId);
        }

        return await fieldMeasurements.ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously creates the <paramref name="entity"/> specified.
    /// </summary>
    /// <param name="entity">The field measurement to create.</param>
    [HttpPost]
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<FieldMeasurement>> CreateAsync(FieldMeasurement entity) => await ProcessFieldMeasurement(entity).ConfigureAwait(false);

    /// <summary>
    /// Asynchronously updates the <paramref name="entity"/> specified.
    /// </summary>
    /// <param name="entity">The field measurement to update.</param>
    [HttpPut]
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<FieldMeasurement>> EditAsync(FieldMeasurement entity) => await ProcessFieldMeasurement(entity).ConfigureAwait(false);

    /// <summary>
    /// Asynchronously deletes the field measurement with the specified <paramref name="id"/>.
    /// </summary>
    /// <param name="id">The id of the field measurement to delete.</param>
    [HttpDelete]
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<IActionResult> DeleteAsync(int id)
    {
        var fieldMeasurementToDelete = await Context.FindAsync(typeof(FieldMeasurement), id).ConfigureAwait(false);
        if (fieldMeasurementToDelete == null)
        {
            return NotFound();
        }

        // Check if associated borehole is locked
        if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), ((FieldMeasurement)fieldMeasurementToDelete).BoreholeId).ConfigureAwait(false))
        {
            return Problem("The borehole is locked by another user or you are missing permissions.");
        }

        Context.Remove(fieldMeasurementToDelete);
        await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
        return Ok();
    }

    private async Task<ActionResult> ProcessFieldMeasurement(FieldMeasurement fieldMeasurement)
    {
        // Check if associated borehole is locked
        if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), fieldMeasurement.BoreholeId).ConfigureAwait(false))
        {
            return Problem("The borehole is locked by another user or you are missing permissions.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (fieldMeasurement.Id != 0)
        {
            var fieldMeasurementToEdit = await Context.FieldMeasurements
            .Include(f => f.FieldMeasurementResults)
            .SingleOrDefaultAsync(f => f.Id == fieldMeasurement.Id).ConfigureAwait(false);

            if (fieldMeasurementToEdit == null)
            {
                return NotFound();
            }

            UpdateFieldMeasurements(fieldMeasurement, fieldMeasurementToEdit);
        }
        else
        {
            await Context.AddAsync(fieldMeasurement).ConfigureAwait(false);
        }

        await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
        return Ok(fieldMeasurement);
    }

    private void UpdateFieldMeasurements(FieldMeasurement source, FieldMeasurement target)
    {
        Context.Entry(target).CurrentValues.SetValues(source);
        target.FieldMeasurementResults = source.FieldMeasurementResults;
    }

        /// <inheritdoc />
    protected override Task<int?> GetBoreholeId(FieldMeasurement entity)
    {
        if (entity == null) return Task.FromResult<int?>(default);

        return Task.FromResult<int?>(entity.BoreholeId);
    }
}
