namespace BDMS.Models;

/// <summary>
/// Represents the authentication settings for the application.
/// </summary>
/// <param name="Authority">The authority URL providing OpenID Connect discovery document.</param>
/// <param name="Audience">The audience for required by the application.</param>
/// <param name="Scopes">The scopes required by the application separated by space.</param>
/// <param name="AnonymousModeEnabled">Indicates whether the anonymous mode is enabled.</param>
public record AuthSettings(string Authority, string Audience, string Scopes, bool AnonymousModeEnabled);
