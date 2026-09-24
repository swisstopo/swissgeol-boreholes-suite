namespace BDMS.Authentication;

/// <summary>
/// Adds security response headers to every response.
/// </summary>
/// <param name="next">The delegate representing the remaining middleware in the request pipeline.</param>
public class SecurityResponseHeaderMiddleware(RequestDelegate next)
{
    /// <summary>
    /// Request handling method.
    /// </summary>
    /// <param name="context">The <see cref="HttpContext"/> for the current request.</param>
    /// <returns>A <see cref="Task"/> that represents the execution of this middleware.</returns>
    public async Task InvokeAsync(HttpContext context)
    {
        context.Response.Headers.Append("X-Frame-Options", "DENY");
        context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");

        // worker-src allows blob:, because the archive import reads the ZIP through a worker the
        // library starts from a blob URL. Without it the work falls back onto the main thread and
        // a large archive freezes the page, cancel button included.
        context.Response.Headers.Append("Content-Security-Policy", "default-src 'self'; worker-src 'self' blob:; frame-src 'none';");

        await next(context).ConfigureAwait(false);
    }
}
