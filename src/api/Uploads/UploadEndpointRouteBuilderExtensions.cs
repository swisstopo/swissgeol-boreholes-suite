using BDMS.Authentication;
using tusdotnet;
using tusdotnet.Models;

namespace BDMS.Uploads;

/// <summary>
/// Maps the routes the chunked uploads arrive on.
/// </summary>
public static class UploadEndpointRouteBuilderExtensions
{
    /// <summary>
    /// Maps the tus endpoints, one per feature.
    /// </summary>
    /// <param name="endpoints">The routes to map into.</param>
    /// <returns>The routes, so calls can be chained.</returns>
    public static IEndpointRouteBuilder MapResumableUploads(this IEndpointRouteBuilder endpoints)
    {
        MapUpload(endpoints, UploadRoutes.LogFiles, httpContext =>
            httpContext.RequestServices.GetRequiredService<LogFileTusEndpoint>().CreateAsync(httpContext));

        MapUpload(endpoints, UploadRoutes.Profiles, httpContext =>
            httpContext.RequestServices.GetRequiredService<ProfileTusEndpoint>().CreateAsync(httpContext));

        return endpoints;
    }

    /// <summary>
    /// Maps one tus endpoint. The role it admits is named here rather than left to the fallback
    /// policy, which admits administrators alone and would refuse every user the per-borehole
    /// check behind the endpoint is there to admit.
    /// </summary>
    /// <param name="endpoints">The routes to map into.</param>
    /// <param name="route">The route the chunks are sent to.</param>
    /// <param name="createConfiguration">Builds the configuration for a single request.</param>
    private static void MapUpload(IEndpointRouteBuilder endpoints, string route, Func<HttpContext, Task<DefaultTusConfiguration>> createConfiguration) =>
        endpoints.MapTus(route, createConfiguration).RequireAuthorization(PolicyNames.Viewer);
}
