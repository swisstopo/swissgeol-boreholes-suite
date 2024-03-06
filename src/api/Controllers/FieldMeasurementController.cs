using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class FieldMeasurementController : BdmsControllerBase<FieldMeasurement>
{
    public FieldMeasurementController(BdmsContext context, ILogger<FieldMeasurement> logger)
        : base(context, logger)
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
        var fieldMeasurements = Context.FieldMeasurements
            .Include(f => f.SampleType)
            .Include(f => f.Parameter)
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

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<ActionResult<FieldMeasurement>> EditAsync(FieldMeasurement entity)
        => base.EditAsync(entity);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> DeleteAsync(int id)
        => base.DeleteAsync(id);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<ActionResult<FieldMeasurement>> CreateAsync(FieldMeasurement entity)
        => base.CreateAsync(entity);
}
