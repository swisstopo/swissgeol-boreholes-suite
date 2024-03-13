using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class FieldMeasurementController : ControllerBaseWithSave
{
    private readonly BdmsContext context;
    private readonly ILogger<FieldMeasurement> logger;
    private readonly IBoreholeLockService boreholeLockService;

    public FieldMeasurementController(BdmsContext context, ILogger<FieldMeasurement> logger, IBoreholeLockService boreholeLockService)
        : base(context, logger)
    {
        this.context = context;
        this.logger = logger;
        this.boreholeLockService = boreholeLockService;
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
        var fieldMeasurements = context.FieldMeasurements
            .Include(f => f.FieldMeasurementResults).ThenInclude(f => f.SampleType)
            .Include(f => f.FieldMeasurementResults).ThenInclude(f => f.Parameter)
            .Include(f => f.Reliability)
            .Include(f => f.Casing)
            .ThenInclude(c => c.Completion)
            .AsNoTracking();

        if (boreholeId != null)
        {
            fieldMeasurements = fieldMeasurements.Where(f => f.BoreholeId == boreholeId);
        }

        return await fieldMeasurements.ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously creates the <paramref name="fieldMeasurement"/> specified.
    /// </summary>
    /// <param name="fieldMeasurement">The field measurement to create.</param>
    [HttpPost]
    [Authorize(Policy = PolicyNames.Viewer)]
    public virtual async Task<IActionResult> CreateAsync(FieldMeasurement fieldMeasurement) => await ProcessFieldMeasurement(fieldMeasurement).ConfigureAwait(false);

    /// <summary>
    /// Asynchronously updates the <paramref name="fieldMeasurement"/> specified.
    /// </summary>
    /// <param name="fieldMeasurement">The field measurement to update.</param>
    [HttpPut]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> EditAsync(FieldMeasurement fieldMeasurement) => await ProcessFieldMeasurement(fieldMeasurement).ConfigureAwait(false);

    /// <summary>
    /// Asynchronously deletes the field measurement with the specified <paramref name="id"/>.
    /// </summary>
    /// <param name="id">The id of the field measurement to delete.</param>
    [HttpDelete]
    [Authorize(Policy = PolicyNames.Viewer)]
    public virtual async Task<IActionResult> DeleteAsync(int id)
    {
        var fieldMeasurementToDelete = await context.FindAsync(typeof(FieldMeasurement), id).ConfigureAwait(false);
        if (fieldMeasurementToDelete == null)
        {
            return NotFound();
        }

        // Check if associated borehole is locked
        if (await boreholeLockService.IsBoreholeLockedAsync(((FieldMeasurement)fieldMeasurementToDelete).BoreholeId, HttpContext.GetUserSubjectId()).ConfigureAwait(false))
        {
            return Problem("The borehole is locked by another user or you are missing permissions.");
        }

        context.Remove(fieldMeasurementToDelete);
        return await SaveChangesAsync(Ok).ConfigureAwait(false);
    }

    private async Task<IActionResult> ProcessFieldMeasurement(FieldMeasurement fieldMeasurement)
    {
        // Check if associated borehole is locked
        if (await boreholeLockService.IsBoreholeLockedAsync(fieldMeasurement.BoreholeId, HttpContext.GetUserSubjectId()).ConfigureAwait(false))
        {
            return Problem("The borehole is locked by another user or you are missing permissions.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (fieldMeasurement.Id != 0)
        {
            var fieldMeasurementToEdit = await context.FieldMeasurements
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
            await context.AddAsync(fieldMeasurement).ConfigureAwait(false);
        }

        return await SaveChangesAsync(() => Ok(fieldMeasurement)).ConfigureAwait(false);
    }

    private void UpdateFieldMeasurements(FieldMeasurement source, FieldMeasurement target)
    {
        context.Entry(target).CurrentValues.SetValues(source);
        target.FieldMeasurementResults = source.FieldMeasurementResults;
    }
}
