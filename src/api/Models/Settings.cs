namespace BDMS.Models;

/// <summary>
/// Represents the settings for the application.
/// </summary>
/// <param name="GoogleAnalyticsTrackingId">The Google Analytics tracking ID.</param>
/// <param name="AuthSettings">The authentication settings.</param>
public record Settings(string? GoogleAnalyticsTrackingId, AuthSettings? AuthSettings);
