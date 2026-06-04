namespace BDMS.Models;

/// <summary>Lightweight projection of <see cref="Profile"/> OCR status for polling.</summary>
public sealed record ProfileOcrStatus(int Id, OcrStatus OcrStatus);
