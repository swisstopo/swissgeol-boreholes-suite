using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

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
    [HttpGet]
    public async Task<IEnumerable<Codelist>> GetAsync(string? schema = null)
    {
        var codeLists = context.Codelists.AsQueryable();

        if (!string.IsNullOrEmpty(schema))
        {
            codeLists = codeLists.Where(c => c.Schema == schema);
        }

        return await codeLists.AsNoTracking().ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously updates the <see cref="Codelist"/> corresponding to
    /// the <paramref name="codelist"/> with the values to update.
    /// </summary>
    /// <param name="codelist"> The <see cref="Codelist"/> to update.</param>
    [HttpPut]
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

        // Update properties if present in codelist parameter
        foreach (PropertyInfo propertyInfo in codelist.GetType().GetProperties())
        {
            if (propertyInfo != null)
            {
                var value = propertyInfo.GetValue(codelist);
                if (value != null && !string.IsNullOrEmpty(value.ToString()))
                {
                    propertyInfo.SetValue(codeListToUpdate, propertyInfo.GetValue(codelist));
                }
            }
        }

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
