using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

/// <summary>
/// Helpers shared between <see cref="StratigraphyController"/> and the
/// stratigraphy-creating actions on <see cref="LithologyController"/>.
/// </summary>
internal static class StratigraphyHelpers
{
    /// <summary>
    /// Returns true if no other stratigraphy on the same borehole already carries the given name.
    /// </summary>
    public static async Task<bool> IsNameUniqueAsync(BdmsContext context, Stratigraphy stratigraphy)
    {
        if (string.IsNullOrEmpty(stratigraphy.Name))
        {
            return true;
        }

        var hasBoreholeStratigraphiesWithSameName = await context.Stratigraphies
            .AnyAsync(s => s.BoreholeId == stratigraphy.BoreholeId && s.Id != stratigraphy.Id && s.Name == stratigraphy.Name)
            .ConfigureAwait(false);

        return !hasBoreholeStratigraphiesWithSameName;
    }

    /// <summary>
    /// Sets <see cref="Stratigraphy.IsPrimary"/> to false on all other stratigraphies of the same borehole.
    /// </summary>
    public static async Task ResetOtherPrimaryStratigraphiesAsync(BdmsContext context, Stratigraphy entity, HttpContext httpContext)
    {
        var otherPrimaryStratigraphies = await context.Stratigraphies
            .Where(s => s.BoreholeId == entity.BoreholeId && s.IsPrimary && s.Id != entity.Id)
            .ToListAsync()
            .ConfigureAwait(false);

        foreach (var other in otherPrimaryStratigraphies)
        {
            other.IsPrimary = false;
            context.Update(other);
        }

        await context.UpdateChangeInformationAndSaveChangesAsync(httpContext).ConfigureAwait(false);
    }

    /// <summary>
    /// Returns a <see cref="ProblemDetails"/> response carrying the well-known
    /// <c>messageKey: "mustBeUnique"</c> extension that the client retry loop recognises.
    /// </summary>
    public static ObjectResult NameMustBeUniqueProblem(ControllerBase controller)
    {
        var result = controller.Problem(detail: "Name must be unique", type: ProblemType.UserError);
        ((ProblemDetails)result.Value!).Extensions["messageKey"] = "mustBeUnique";
        return result;
    }
}
