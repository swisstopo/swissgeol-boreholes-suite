using System.Net;

namespace BDMS.Uploads;

/// <summary>
/// Answers a refused upload with the problem response the client understands.
///
/// A tus request has no body of its own to carry a reason, whether it is refused as it is created
/// or once its last chunk has been answered. Without this the client would see nothing but a
/// transport error and the reason would be visible in the network tab alone.
/// </summary>
public class TusUploadErrorMiddleware
{
    private readonly RequestDelegate next;
    private readonly ILogger<TusUploadErrorMiddleware> logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="TusUploadErrorMiddleware"/> class.
    /// </summary>
    public TusUploadErrorMiddleware(RequestDelegate next, ILogger<TusUploadErrorMiddleware> logger)
    {
        this.next = next;
        this.logger = logger;
    }

    /// <summary>
    /// Passes the request on and turns a refused upload into a problem response.
    /// </summary>
    /// <param name="context">The request the upload arrives on.</param>
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context).ConfigureAwait(false);
        }
        catch (LogFileUploadException ex)
        {
            logger.LogError(ex, "A log file upload was refused.");

            // A client error rather than a server one, because the upload client retries a
            // request that failed with a server error and this one fails the same way every time.
            await Results
                .Problem(detail: ex.Message, statusCode: (int)HttpStatusCode.BadRequest, type: ProblemType.UserError)
                .ExecuteAsync(context)
                .ConfigureAwait(false);
        }
    }
}
