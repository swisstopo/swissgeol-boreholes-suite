namespace BDMS.Uploads;

/// <summary>
/// The routes the chunked uploads are reached under, one per feature.
///
/// A route is read in three places: the endpoint answers with it, the application maps it, and the
/// middleware that turns a refusal into a problem response wraps it. They are named here so that
/// the three are the same route. One mapped outside what the middleware wraps would answer a
/// refusal with a bare failure the client can read no reason out of.
/// </summary>
public static class UploadRoutes
{
    /// <summary>The route log file chunks are sent to.</summary>
    public const string LogFiles = "/api/v2/log/upload/tus";

    // Every route named above belongs here, or the middleware is never wrapped around it.
    private static readonly string[] all = [LogFiles];

    /// <summary>
    /// Whether a request addresses one of the uploads. Every request after the one that creates an
    /// upload names it below the route, so the route is matched as a prefix rather than in full.
    /// </summary>
    /// <param name="path">The path of the request.</param>
    /// <returns><see langword="true"/> if the request belongs to an upload; otherwise, <see langword="false"/>.</returns>
    public static bool Matches(PathString path)
    {
        foreach (var route in all)
        {
            if (path.StartsWithSegments(route, StringComparison.OrdinalIgnoreCase)) return true;
        }

        return false;
    }
}
