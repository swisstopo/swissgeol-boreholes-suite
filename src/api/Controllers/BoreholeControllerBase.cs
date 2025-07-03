using BDMS.Models;
using Microsoft.AspNetCore.Mvc;

namespace BDMS.Controllers;

/// <summary>
/// Base controller for all borehole editing actions.
/// </summary>
/// <typeparam name="TEntity">The controller to edit a borehole.</typeparam>
[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public abstract class BoreholeControllerBase<TEntity> : ControllerBase
    where TEntity : IIdentifyable, IChangeTracking, new()
{
    private readonly BdmsContext context;
    private readonly ILogger<BoreholeControllerBase<TEntity>> logger;
    private readonly IBoreholePermissionService boreholePermissionService;

    /// <summary>
    /// Gets the <see cref="BdmsContext"/> used by the controller.
    /// </summary>
    protected BdmsContext Context => context;

    /// <summary>
    /// Gets the <see cref="ILogger{TEntity}"/> used by the controller.
    /// </summary>
    protected ILogger<BoreholeControllerBase<TEntity>> Logger => logger;

    /// <summary>
    /// Gets the <see cref="IBoreholePermissionService"/> used by the controller.
    /// </summary>
    protected IBoreholePermissionService BoreholePermissionService => boreholePermissionService;

    protected BoreholeControllerBase(BdmsContext context, ILogger<BoreholeControllerBase<TEntity>> logger, IBoreholePermissionService boreholePermissionService)
    {
        this.context = context;
        this.logger = logger;
        this.boreholePermissionService = boreholePermissionService;
    }

    /// <summary>
    /// Gets the id of the <see cref="Borehole"/> to which the <paramref name="entity"/> belongs.
    /// </summary>
    /// <param name="entity">The <paramref name="entity"/>.</param>
    /// <returns>The id of the borehole.</returns>
    protected abstract Task<int?> GetBoreholeId(TEntity entity);

    /// <summary>
    /// Asynchronously creates the <paramref name="entity"/> specified.
    /// </summary>
    /// <param name="entity">The entity to create.</param>
    [HttpPost]
    public virtual async Task<ActionResult<TEntity>> CreateAsync(TEntity entity)
    {
        var boreholeId = await GetBoreholeId(entity).ConfigureAwait(false);

        // If no boreholeId is present the entity being created is a new borehole
        if (entity is Borehole)
        {
            if (boreholeId > 0)
            {
                return Problem("You cannot create a new borehole with a defined Id.");
            }
            else
            {
                var borehole = entity as Borehole;
                if (!await boreholePermissionService.HasUserRoleOnWorkgroupAsync(HttpContext.GetUserSubjectId(), borehole.WorkgroupId, Role.Editor).ConfigureAwait(false))
                {
                    return Problem("You are missing permissions to create a borehole.");
                }
            }
        }

        // Otherwise check if the borehole associated with the entity is locked
        else
        {
            if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false))
            {
                return Problem("The borehole is locked by another user or you are missing permissions.");
            }
        }

        await context.AddAsync(entity).ConfigureAwait(false);
        return await SaveChangesAsync(() => Ok(entity)).ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously updates the <paramref name="entity"/> specified.
    /// </summary>
    /// <param name="entity">The entity to update.</param>
    [HttpPut]
    public virtual async Task<ActionResult<TEntity>> EditAsync(TEntity entity)
    {
        if (entity == null)
        {
            return BadRequest(ModelState);
        }

        // Check if associated borehole is locked
        var boreholeId = await GetBoreholeId(entity).ConfigureAwait(false);
        if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false))
        {
            return Problem("The borehole is locked by another user or you are missing permissions.");
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

        // Check if associated borehole is locked
        var boreholeId = await GetBoreholeId((TEntity)entityToDelete).ConfigureAwait(false);
        if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false))
        {
            return Problem("The borehole is locked by another user or you are missing permissions.");
        }

        context.Remove(entityToDelete);
        await context.SaveChangesAsync().ConfigureAwait(false);
        return Ok();
    }

    private async Task<ActionResult<TEntity>> SaveChangesAsync(Func<ActionResult<TEntity>> successResult)
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
