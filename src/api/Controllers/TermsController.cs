using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Annotations;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class TermsController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly ILogger<TermsController> logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="TermsController"/> class.
    /// </summary>
    /// <param name="context">The <see cref="BdmsContext"/> used by the controller.</param>
    /// <param name="logger">The logger used by the controller.</param>
    public TermsController(BdmsContext context, ILogger<TermsController> logger)
    {
        this.context = context;
        this.logger = logger;
    }

    /// <summary>
    /// Gets the currently published <see cref="Term"/>, or <c>null</c> if none is published.
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    [SwaggerResponse(StatusCodes.Status200OK, "Returns the currently published terms, or null if none exist.")]
    public async Task<ActionResult<Term?>> GetAsync()
    {
        var publishedTerm = await GetPublishedTermAsync().ConfigureAwait(false);
        return Ok(publishedTerm);
    }

    /// <summary>
    /// Gets the current draft <see cref="Term"/>. Falls back to the published term when no draft
    /// exists, or <c>null</c> if neither exists.
    /// </summary>
    [HttpGet("draft")]
    [Authorize(Policy = PolicyNames.Admin)]
    [SwaggerResponse(StatusCodes.Status200OK, "Returns the draft terms, the published terms as fallback, or null.")]
    public async Task<ActionResult<Term?>> GetDraftAsync()
    {
        var draftTerm = await context.Terms
            .AsNoTracking()
            .SingleOrDefaultAsync(t => t.IsDraft)
            .ConfigureAwait(false);

        return Ok(draftTerm ?? await GetPublishedTermAsync().ConfigureAwait(false));
    }

    /// <summary>
    /// Creates or updates the single draft <see cref="Term"/> with the provided texts.
    /// </summary>
    /// <param name="term">The term carrying the localized texts to store as draft.</param>
    [HttpPut("draft")]
    [Authorize(Policy = PolicyNames.Admin)]
    [SwaggerResponse(StatusCodes.Status200OK, "The draft was saved successfully.")]
    [SwaggerResponse(StatusCodes.Status500InternalServerError, "The server encountered an unexpected condition that prevented it from fulfilling the request.")]
    public async Task<IActionResult> SaveDraftAsync(Term term)
    {
        try
        {
            var draftTerm = await context.Terms
                .SingleOrDefaultAsync(t => t.IsDraft)
                .ConfigureAwait(false);

            if (draftTerm == null)
            {
                draftTerm = new Term { IsDraft = true, Creation = DateTime.UtcNow };
                await context.Terms.AddAsync(draftTerm).ConfigureAwait(false);
            }

            draftTerm.TextEn = term.TextEn ?? "";
            draftTerm.TextDe = term.TextDe ?? "";
            draftTerm.TextFr = term.TextFr ?? "";
            draftTerm.TextIt = term.TextIt ?? "";
            draftTerm.TextRo = term.TextRo ?? "";

            await context.SaveChangesAsync().ConfigureAwait(false);
            return Ok(draftTerm);
        }
        catch (Exception e)
        {
            var message = "Error while saving terms draft.";
            logger.LogError(e, message);
            return Problem(message);
        }
    }

    /// <summary>
    /// Publishes the current draft <see cref="Term"/>, expiring the previously published term.
    /// </summary>
    [HttpPost("publish")]
    [Authorize(Policy = PolicyNames.Admin)]
    [SwaggerResponse(StatusCodes.Status200OK, "The draft was published successfully.")]
    [SwaggerResponse(StatusCodes.Status400BadRequest, "There is no draft to publish.")]
    [SwaggerResponse(StatusCodes.Status500InternalServerError, "The server encountered an unexpected condition that prevented it from fulfilling the request.")]
    public async Task<IActionResult> PublishAsync()
    {
        try
        {
            var draftTerm = await context.Terms
                .SingleOrDefaultAsync(t => t.IsDraft)
                .ConfigureAwait(false);

            if (draftTerm == null)
            {
                return BadRequest("There is no draft to publish.");
            }

            var publishedTerm = await context.Terms
                .SingleOrDefaultAsync(t => !t.IsDraft && t.Expiration == null)
                .ConfigureAwait(false);

            if (publishedTerm != null)
            {
                publishedTerm.Expiration = DateTime.UtcNow;
            }

            draftTerm.IsDraft = false;

            await context.SaveChangesAsync().ConfigureAwait(false);
            return Ok(draftTerm);
        }
        catch (Exception e)
        {
            var message = "Error while publishing terms.";
            logger.LogError(e, message);
            return Problem(message);
        }
    }

    private Task<Term?> GetPublishedTermAsync()
        => context.Terms
            .AsNoTracking()
            .SingleOrDefaultAsync(t => !t.IsDraft && t.Expiration == null);
}
