using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class HydrotestController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly ILogger<Hydrotest> logger;

    public HydrotestController(BdmsContext context, ILogger<Hydrotest> logger)
    {
        this.context = context;
        this.logger = logger;
    }

    /// <summary>
    /// Asynchronously gets all hydrotest records optionally filtered by <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the borehole referenced in the observations to get.</param>
    /// <returns>An IEnumerable of type <see cref="Hydrotest"/>.</returns>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<Hydrotest>> GetAsync([FromQuery] int? boreholeId = null)
    {
        var hydrotestes = context.Hydrotests
            .Include(w => w.TestKind)
            .Include(w => w.Codelists)
            .Include(w => w.Reliability)
            .Include(w => w.HydrotestResults).ThenInclude(h => h.Parameter)
            .AsNoTracking();

        if (boreholeId != null)
        {
            hydrotestes = hydrotestes.Where(w => w.BoreholeId == boreholeId);
        }

        return await hydrotestes.ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously creates the <paramref name="hydrotest"/> specified.
    /// </summary>
    /// <param name="hydrotest">The hydrotest to create.</param>
    [HttpPost]
    public virtual async Task<IActionResult> CreateAsync(Hydrotest hydrotest) => await ProcessHydrotestAsync(hydrotest).ConfigureAwait(false);

    /// <summary>
    /// Asynchronously updates the <paramref name="hydrotest"/> specified.
    /// </summary>
    /// <param name="hydrotest">The hydrotest to update.</param>
    [HttpPut]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> EditHydrotestAsync(Hydrotest hydrotest) => await ProcessHydrotestAsync(hydrotest).ConfigureAwait(false);

    /// <summary>
    /// Asynchronously deletes the hydrotest with the specified <paramref name="id"/>.
    /// </summary>
    /// <param name="id">The id of the hydrotest to delete.</param>
    [HttpDelete]
    public virtual async Task<IActionResult> DeleteAsync(int id)
    {
        var hydrotestToDelete = await context.FindAsync(typeof(Hydrotest), id).ConfigureAwait(false);
        if (hydrotestToDelete == null)
        {
            return NotFound();
        }

        context.Remove(hydrotestToDelete);
        return await SaveChangesAsync(Ok).ConfigureAwait(false);
    }

    private async Task<IActionResult> ProcessHydrotestAsync(Hydrotest hydrotest)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (!AreHydrotestCodelistsCompatible(hydrotest))
        {
            return BadRequest("You submitted codelists for evaluation method, flow direction, or hydrotest results that are not compatible with the provided hydrotest kind.");
        }

        if (hydrotest.CodelistIds != null)
        {
            hydrotest.Codelists = await context.Codelists
                .Where(c => hydrotest.CodelistIds.Contains(c.Id))
                .ToListAsync().ConfigureAwait(false);
        }

        if (hydrotest.Id != 0)
        {
            var hydrotestToEdit = await context.Hydrotests
                .Include(h => h.Codelists)
                .Include(h => h.HydrotestResults)
                .SingleOrDefaultAsync(w => w.Id == hydrotest.Id).ConfigureAwait(false);

            if (hydrotestToEdit == null)
            {
                return NotFound();
            }

            context.Entry(hydrotestToEdit).CurrentValues.SetValues(hydrotest);
            hydrotestToEdit.Codelists = hydrotest.Codelists;
            hydrotestToEdit.HydrotestResults = hydrotest.HydrotestResults;
        }
        else
        {
            await context.AddAsync(hydrotest).ConfigureAwait(false);
        }

        return await SaveChangesAsync(() => Ok(hydrotest)).ConfigureAwait(false);
    }

    private bool AreHydrotestCodelistsCompatible(Hydrotest hydrotest)
    {
        // Get the Geolcode associated with the TestKindId.
        int testKindGeolCode = context.Codelists.SingleOrDefault(c => c.Id == hydrotest.TestKindId)?.Geolcode ?? 0;

        // If there are HydrotestResults, check if the ParameterIds in the results are compatible.
        if (hydrotest.HydrotestResults?.Any() == true)
        {
            var compatibleParameterIds = GetCompatibleCodelistIds(testKindGeolCode, HydrogeologySchemas.HydrotestResultParameterSchema, HydroCodeLookup.HydrotestResultParameterOptions);
            if (!hydrotest.HydrotestResults.All(r => compatibleParameterIds.Contains(r.ParameterId)))
            {
                return false;
            }
        }

        var compatibleCodelistIds = new List<int>();

        // If there are CodelistIds, find the compatible CodelistIds for the flow direction and evaluation method options.
        if (hydrotest.CodelistIds?.Any() == true)
        {
            compatibleCodelistIds.AddRange(GetCompatibleCodelistIds(testKindGeolCode, HydrogeologySchemas.FlowdirectionSchema, HydroCodeLookup.HydrotestFlowDirectionOptions));
            compatibleCodelistIds.AddRange(GetCompatibleCodelistIds(testKindGeolCode, HydrogeologySchemas.EvaluationMethodSchema, HydroCodeLookup.HydrotestEvaluationMethodOptions));
        }

        // Return true if all CodelistIds are compatible, or there are no CodelistIds.
        return hydrotest.CodelistIds?.All(c => compatibleCodelistIds.Contains(c)) ?? true;
    }

    private List<int> GetCompatibleCodelistIds(int testKindGeolCode, string schema, Dictionary<int, List<int>> optionsLookup)
    {
        // Get the list of Geolcodes from the optionsLookup based on the testKindGeolCode and find the compatible CodelistIds.
        if (optionsLookup.TryGetValue(testKindGeolCode, out List<int>? geolcodes))
        {
            return context.Codelists
                .Where(c => c.Schema == schema && c.Geolcode != null && geolcodes.Contains(c.Geolcode.Value))
                .Select(c => c.Id)
                .ToList();
        }

        return new List<int>();
    }

    private async Task<IActionResult> SaveChangesAsync(Func<IActionResult> successResult)
    {
        try
        {
            await context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
            return successResult();
        }
        catch (Exception ex)
        {
            var errorMessage = "An error occurred while saving the entity changes.";
            logger?.LogError(ex, errorMessage);
            return Problem(errorMessage, statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}
