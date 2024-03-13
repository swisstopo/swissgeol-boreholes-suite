using BDMS.Models;
using Microsoft.AspNetCore.Mvc;

namespace BDMS.Controllers;
public abstract class ControllerBaseWithSave : ControllerBase
{
    private readonly BdmsContext context;
    private readonly ILogger logger;

    protected ControllerBaseWithSave(BdmsContext context, ILogger logger)
    {
        this.context = context;
        this.logger = logger;
    }

    protected async Task<IActionResult> SaveChangesAsync(Func<IActionResult> successResult)
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
            return Problem(errorMessage);
        }
    }
}
