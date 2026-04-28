using Microsoft.Extensions.Caching.Memory;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;

namespace BDMS.Authentication;

/// <summary>
/// Fetches user profile claims from the OIDC UserInfo endpoint and caches them.
/// </summary>
/// <remarks>
/// When the API receives an access token (which lacks profile claims), this service
/// calls the OIDC UserInfo endpoint to retrieve the user's email, given name, and
/// family name. Results are cached per-user for <see cref="CacheTimeToLiveInMinutes"/>
/// minutes to avoid redundant HTTP calls. Returns <c>null</c> on failure; the caller
/// is expected to reject the request (HTTP 401).
/// </remarks>
public class UserInfoService
{
    /// <summary>
    /// Duration in minutes that UserInfo responses are cached per user.
    /// 60 minutes aligns with typical access token lifetimes and is appropriate
    /// because profile data (name, email) changes very rarely.
    /// </summary>
    internal const int CacheTimeToLiveInMinutes = 60;

    private const string DiscoveryCacheKey = "userinfo-endpoint";

    private readonly IMemoryCache cache;
    private readonly HttpClient httpClient;
    private readonly IConfiguration configuration;
    private readonly ILogger<UserInfoService> logger;

    public UserInfoService(IMemoryCache cache, IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<UserInfoService> logger)
    {
        this.cache = cache;
        this.httpClient = httpClientFactory.CreateClient();
        this.configuration = configuration;
        this.logger = logger;
    }

    /// <summary>
    /// Gets user profile claims (email, given_name, family_name) from the OIDC UserInfo endpoint.
    /// Returns cached claims if available, otherwise fetches from the endpoint and caches the result.
    /// </summary>
    /// <param name="sub">The user's subject identifier.</param>
    /// <param name="accessToken">The access token to authenticate with the UserInfo endpoint.</param>
    /// <param name="cancellationToken">Token to cancel the operation.</param>
    /// <returns>The user's profile claims, or <c>null</c> if the UserInfo endpoint is unreachable.</returns>
    public async Task<IEnumerable<Claim>?> GetUserInfoClaimsAsync(string sub, string accessToken, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"userinfo:{sub}";

        if (cache.TryGetValue(cacheKey, out IEnumerable<Claim>? cachedClaims))
            return cachedClaims;

        try
        {
            var endpoint = await GetUserInfoEndpointAsync(cancellationToken).ConfigureAwait(false);
            using var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await httpClient.SendAsync(request, cancellationToken).ConfigureAwait(false);
            response.EnsureSuccessStatusCode();

            var userInfo = await response.Content.ReadFromJsonAsync<Dictionary<string, JsonElement>>(cancellationToken).ConfigureAwait(false);

            var claims = new List<Claim>();
            if (userInfo != null)
            {
                if (userInfo.TryGetValue("email", out var email) && email.GetString() is string emailValue)
                    claims.Add(new Claim(ClaimTypes.Email, emailValue));
                if (userInfo.TryGetValue("given_name", out var givenName) && givenName.GetString() is string givenNameValue)
                    claims.Add(new Claim(ClaimTypes.GivenName, givenNameValue));
                if (userInfo.TryGetValue("family_name", out var familyName) && familyName.GetString() is string familyNameValue)
                    claims.Add(new Claim(ClaimTypes.Surname, familyNameValue));
            }

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheTimeToLiveInMinutes));

            cache.Set(cacheKey, claims.AsEnumerable(), cacheOptions);
            return claims;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to fetch UserInfo for sub {Sub}", sub);
            return null;
        }
    }

    private async Task<string> GetUserInfoEndpointAsync(CancellationToken cancellationToken)
    {
        if (cache.TryGetValue(DiscoveryCacheKey, out string? cachedEndpoint) && cachedEndpoint is not null)
            return cachedEndpoint;

        var authority = configuration["Auth:Authority"]?.TrimEnd('/');
        var discoveryUrl = new Uri($"{authority}/.well-known/openid-configuration");

        var response = await httpClient.GetAsync(discoveryUrl, cancellationToken).ConfigureAwait(false);
        response.EnsureSuccessStatusCode();

        var discovery = await response.Content.ReadFromJsonAsync<Dictionary<string, JsonElement>>(cancellationToken).ConfigureAwait(false);

        if (discovery is null
            || !discovery.TryGetValue("userinfo_endpoint", out var element)
            || element.GetString() is not string url)
        {
            throw new InvalidOperationException("UserInfo endpoint not found in OIDC discovery document.");
        }

        cache.Set(DiscoveryCacheKey, url, TimeSpan.FromMinutes(CacheTimeToLiveInMinutes));
        return url;
    }
}
