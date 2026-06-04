using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Lifecycle status of OCR processing for a <see cref="Profile"/> file.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum OcrStatus
{
    /// <summary>The file is queued for OCR but has not started yet.</summary>
    Created,

    /// <summary>OCR has been started and is being polled for completion.</summary>
    Processing,

    /// <summary>OCR completed successfully.</summary>
    Success,

    /// <summary>OCR failed terminally. A manual reset of <see cref="OcrStatus"/> is required to retry.</summary>
    Error,

    /// <summary>The file is not eligible for OCR (e.g. non-PDF content type).</summary>
    WillNotBeProcessed,
}
