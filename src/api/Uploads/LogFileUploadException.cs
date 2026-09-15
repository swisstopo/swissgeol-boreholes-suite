namespace BDMS.Uploads;

/// <summary>
/// A finished upload that could not be stored for a reason the user can act on, such as a name
/// the log run already holds. The message is shown to the user, so it names what to change.
/// </summary>
public class LogFileUploadException : Exception
{
    /// <summary>
    /// Initializes a new instance of the <see cref="LogFileUploadException"/> class.
    /// </summary>
    public LogFileUploadException()
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="LogFileUploadException"/> class.
    /// </summary>
    /// <param name="message">What the user has to change.</param>
    public LogFileUploadException(string message)
        : base(message)
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="LogFileUploadException"/> class.
    /// </summary>
    /// <param name="message">What the user has to change.</param>
    /// <param name="innerException">The failure this was raised for.</param>
    public LogFileUploadException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
