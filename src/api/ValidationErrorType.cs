namespace BDMS;

/// <summary>
/// Types of validation errors used to prefix error messages and index the errors.
/// </summary>
public enum ValidationErrorType
{
    Unknown = 0,
    Json,
    Csv,
    Attachment,
}
