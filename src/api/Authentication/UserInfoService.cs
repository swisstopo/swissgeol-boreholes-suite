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
/// minutes to avoid redundant HTTP calls. On failure, returns <c>null</c> so the caller
/// can fall back to DB-cached values.
/// </remarks>
public class UserInfoService
{
    /// <summary>
    /// Duration in minutes that UserInfo responses are cached per user.
    /// 60 minutes aligns with typical access token lifetimes and is appropriate
    /// because profile data (name, email) changes very rarely.
    /// </summary>
    internal const int CacheTimeToLiveInMinutes = 60;

    private readonly IMemoryCache cache;
    private readonly HttpClient httpClient;
    private readonly IConfiguration configuration;
    private readonly ILogger<UserInfoService> logger;
    private string? userInfoEndpoint;

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
    /// <returns>The user's profile claims, or <c>null</c> if the UserInfo endpoint is unreachable.</returns>
    public async Task<IEnumerable<Claim>?> GetUserInfoClaimsAsync(string sub, string accessToken)
    {
        var cacheKey = $"userinfo:{sub}";

        if (cache.TryGetValue(cacheKey, out IEnumerable<Claim>? cachedClaims))
            return cachedClaims;

        try
        {
            var endpoint = await GetUserInfoEndpointAsync().ConfigureAwait(false);
            var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await httpClient.SendAsync(request).ConfigureAwait(false);
            response.EnsureSuccessStatusCode();

            var userInfo = await response.Content.ReadFromJsonAsync<Dictionary<string, JsonElement>>().ConfigureAwait(false);

            var claims = new List<Claim>();
            if (userInfo != null)
            {
                if (userInfo.TryGetValue("email", out var email))
                    claims.Add(new Claim(ClaimTypes.Email, email.GetString()!));
                if (userInfo.TryGetValue("given_name", out var givenName))
                    claims.Add(new Claim(ClaimTypes.GivenName, givenName.GetString()!));
                if (userInfo.TryGetValue("family_name", out var familyName))
                    claims.Add(new Claim(ClaimTypes.Surname, familyName.GetString()!));
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

    private async Task<string> GetUserInfoEndpointAsync()
    {
        if (userInfoEndpoint != null)
            return userInfoEndpoint;

        var authority = configuration["Auth:Authority"]?.TrimEnd('/');
        var discoveryUrl = $"{authority}/.well-known/openid-configuration";

        var response = await httpClient.GetAsync(discoveryUrl).ConfigureAwait(false);
        response.EnsureSuccessStatusCode();

        var discovery = await response.Content.ReadFromJsonAsync<Dictionary<string, JsonElement>>().ConfigureAwait(false);

        userInfoEndpoint = discovery!["userinfo_endpoint"].GetString()
            ?? throw new InvalidOperationException("UserInfo endpoint not found in OIDC discovery document.");

        return userInfoEndpoint;
    }
}