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
    public virtual async Task<IActionResult> CreateAsync(Hydrotest hydrotest)
    {
        return await ProcessHydrotestAsync(hydrotest).ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously updates the <paramref name="hydrotest"/> specified.
    /// </summary>
    /// <param name="hydrotest">The hydrotest to update.</param>
    [HttpPut]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> EditHydrotestAsync(Hydrotest hydrotest)
    {
        return await ProcessHydrotestAsync(hydrotest, true).ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously deletes the entity with the specified <paramref name="id"/>.
    /// </summary>
    /// <param name="id">The id of the entity to delete.</param>
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

    private async Task<IActionResult> ProcessHydrotestAsync(Hydrotest hydrotest, bool isEdit = false)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (hydrotest.TestKindId >= 15203170 && hydrotest.TestKindId < 15203186)
        {
            if (!AreHydrotestCodelistsCompatible(hydrotest))
            {
                return BadRequest("You submitted codelists for evaluationMethod, flowDirection, or hydrotestResults that are not compatible with the provided testKind.");
            }
        }

        if (hydrotest.CodelistIds != null)
        {
            hydrotest = await GetCodelistsFromIds(hydrotest.CodelistIds, hydrotest).ConfigureAwait(false);
        }

        if (isEdit)
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

    private async Task<Hydrotest> GetCodelistsFromIds(ICollection<int> codelistIds, Hydrotest hydrotest)
    {
        // Fetch related codelists from the database
        var relatedCodelists = await context.Codelists
            .Where(c => codelistIds.Contains(c.Id))
            .ToListAsync().ConfigureAwait(false);

        // Initialize and replace the existing codelists with the fetched ones
        hydrotest.Codelists = relatedCodelists;

        return hydrotest;
    }

    private bool AreHydrotestCodelistsCompatible(Hydrotest hydrotest)
    {
        List<int> flowDirectionIds = HydroCodeLookup.HydrotestFlowDirectionOptions[hydrotest.TestKindId];
        List<int> evaluationMethodIds = HydroCodeLookup.HydrotestEvaluationMethodOptions[hydrotest.TestKindId];

        var compatibleCodelistIds = flowDirectionIds.Concat(evaluationMethodIds);

        List<int> hydrotestResultIds = HydroCodeLookup.HydrotestResultOptions[hydrotest.TestKindId];

        var areCodelistsCompatible = hydrotest.CodelistIds != null ? hydrotest.CodelistIds.All(c => compatibleCodelistIds.Contains(c)) : true;
        var areHydrotestResultsCompatible = hydrotest.HydrotestResults != null && hydrotest.HydrotestResults.Count >= 0 ? hydrotest.HydrotestResults.Select(r => r.ParameterId).All(c => hydrotestResultIds.Contains(c)) : true;
        return areCodelistsCompatible && areHydrotestResultsCompatible;
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
