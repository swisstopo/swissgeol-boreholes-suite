using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class CodeListController : ControllerBase
{
    public BdmsContext Context { get; }

    public CodeListController(BdmsContext context)
    {
        Context = context;
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Codelist"/>s, optionally filtered by <paramref name= "schema"/>.
    /// </summary>
    /// <param name = "schema">The schema of the codeLists to get.</param>
    [HttpGet]
    public async Task<IEnumerable<Codelist>> GetAsync(string? schema = null)
    {
        var codeLists = Context.Codelists.AsQueryable();

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
    /// <param name ="codelist"> The <see cref="Codelist"/> to update.</param>
    [HttpPut]
    public async Task<IActionResult> EditAsync(Codelist codelist)
    {
        if (codelist == null)
        {
            return BadRequest(ModelState);
        }

        var codeListToUpdate = await Context.Codelists.SingleOrDefaultAsync(c => c.Id == codelist.Id).ConfigureAwait(false);

        if (codeListToUpdate == null)
        {
            return NotFound();
        }

        // update properties if presernt in codelist parameter
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

        return await SaveChangesAsync(() => new OkObjectResult(codeListToUpdate)).ConfigureAwait(false);
    }

    private async Task<IActionResult> SaveChangesAsync(Func<IActionResult> successResult)
    {
        try
        {
            await Context.SaveChangesAsync().ConfigureAwait(false);
            return successResult();
        }
        catch (Exception ex)
        {
            var errorMessage = $"An error occurred while saving the entity changes : {ex}";
            return Problem(errorMessage, statusCode: StatusCodes.Status400BadRequest);
        }
    }
}
