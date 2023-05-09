using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class CodeListController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly ILogger logger;

    public CodeListController(BdmsContext context, ILogger<CodeListController> logger)
    {
        this.context = context;
        this.logger = logger;
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Codelist"/>s, optionally filtered by <paramref name="schema"/>.
    /// </summary>
    /// <param name="schema">The schema of the codelists to get.</param>
    /// <param name="testKindId">The hydrotest kind used to filter the codelists to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<Codelist>> GetAsync(string? schema = null, int? testKindId = null)
    {
        var codeLists = context.Codelists.AsQueryable();

        if (!string.IsNullOrEmpty(schema))
        {
            codeLists = codeLists.Where(c => c.Schema == schema);
        }

        if (testKindId != null && testKindId >= 15203170 && testKindId < 15203186)
        {
            List<int> hydrotestResultIds = HydroCodeLookup.HydrotestResultOptions[testKindId.Value];
            List<int> flowDirectionIds = HydroCodeLookup.HydrotestFlowDirectionOptions[testKindId.Value];
            List<int> evaluationMethodIds = HydroCodeLookup.HydrotestEvaluationMethodOptions[testKindId.Value];

            var hydrotestResultOptions = codeLists.Where(h => hydrotestResultIds.Contains(h.Id));
            var flowDirectionOptions = codeLists.Where(h => flowDirectionIds.Contains(h.Id));
            var evaluationMethodOptions = codeLists.Where(h => evaluationMethodIds.Contains(h.Id));

            codeLists = hydrotestResultOptions.Concat(flowDirectionOptions).Concat(evaluationMethodOptions);
        }

        return await codeLists.AsNoTracking().ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously updates the <see cref="Codelist"/> corresponding to
    /// the <paramref name="codelist"/> with the values to update.
    /// </summary>
    /// <param name="codelist"> The <see cref="Codelist"/> to update.</param>
    [HttpPut]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> EditAsync(Codelist codelist)
    {
        if (codelist == null)
        {
            return BadRequest(ModelState);
        }

        var codeListToUpdate = await context.Codelists.SingleOrDefaultAsync(c => c.Id == codelist.Id).ConfigureAwait(false);

        if (codeListToUpdate == null)
        {
            return NotFound();
        }

        context.Entry(codeListToUpdate).CurrentValues.SetValues(codelist);

        try
        {
            await context.SaveChangesAsync().ConfigureAwait(false);
            return Ok(codeListToUpdate);
        }
        catch (Exception ex)
        {
            var errorMessage = "An error occurred while saving the entity changes.";
            logger.LogError(ex, errorMessage);
            return Problem(errorMessage, statusCode: StatusCodes.Status400BadRequest);
        }
    }
}
