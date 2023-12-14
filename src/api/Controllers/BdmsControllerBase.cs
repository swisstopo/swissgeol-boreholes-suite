using BDMS.Models;
using Microsoft.AspNetCore.Mvc;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class BdmsControllerBase<TEntity> : ControllerBase
    where TEntity : IIdentifyable, IChangeTracking, new()
{
    private readonly BdmsContext context;
    private readonly ILogger<TEntity> logger;

    /// <summary>
    /// Gets the <see cref="BdmsContext"/> used by the controller.
    /// </summary>
    protected BdmsContext Context => context;
    /// <summary>
 
    /// Gets the <see cref="ILogger{TCategoryName}"/> used by the controller.
    /// </summary>
    protected ILogger<TEntity> Logger => logger;

    protected BdmsControllerBase(BdmsContext context, ILogger<TEntity> logger)
    {
        this.context = context;
        this.logger = logger;
    }

    /// <summary>
    /// Asynchronously creates the <paramref name="entity"/> specified.
    /// </summary>
    /// <param name="entity">The entity to create.</param>
    [HttpPost]
    public virtual async Task<IActionResult> CreateAsync(TEntity entity)
    {
        await context.AddAsync(entity).ConfigureAwait(false);
        return await SaveChangesAsync(() => Ok(entity)).ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously updates the <paramref name="entity"/> specified.
    /// </summary>
    /// <param name="entity">The entity to update.</param>
    [HttpPut]
    public virtual async Task<IActionResult> EditAsync(TEntity entity)
    {
        if (entity == null)
        {
            return BadRequest(ModelState);
        }

        var entityToEdit = (TEntity?)await context.FindAsync(typeof(TEntity), entity.Id).ConfigureAwait(false);

        if (entityToEdit == null)
        {
            return NotFound();
        }

        context.Entry(entityToEdit).CurrentValues.SetValues(entity);

        return await SaveChangesAsync(() => Ok(entity)).ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously deletes the entity with the specified <paramref name="id"/>.
    /// </summary>
    /// <param name="id">The id of the entity to delete.</param>
    [HttpDelete]
    public virtual async Task<IActionResult> DeleteAsync(int id)
    {
        var entityToDelete = await context.FindAsync(typeof(TEntity), id).ConfigureAwait(false);
        if (entityToDelete == null)
        {
            return NotFound();
        }

        context.Remove(entityToDelete);
        return await SaveChangesAsync(Ok).ConfigureAwait(false);
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
            return Problem(errorMessage);
        }
    }
}
