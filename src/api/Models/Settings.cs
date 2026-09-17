namespace BDMS.Models;

/// <summary>
/// Represents the settings for the application.
/// </summary>
/// <param name="GoogleAnalyticsTrackingId">The Google Analytics tracking ID.</param>
/// <param name="AuthSettings">The authentication settings.</param>
/// <param name="UploadSettings">The limits every file upload has to stay within.</param>
public record Settings(string? GoogleAnalyticsTrackingId, AuthSettings? AuthSettings, UploadSettings UploadSettings);
