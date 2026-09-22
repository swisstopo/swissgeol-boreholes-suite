namespace BDMS.Uploads;

/// <summary>
/// An upload whose name the log run already holds. This is the only upload failure the user is
/// told about in words, because it is the only one they can put right. It carries a key rather
/// than a sentence, because the API does not know the language the message is read in.
/// </summary>
public class LogFileNameTakenException : UploadRefusedException
{
    /// <summary>The key the client translates.</summary>
    public const string MessageKeyValue = "logFileNameAlreadyExists";

    /// <summary>The name the log run already holds, named in the translated message.</summary>
    public string FileName { get; init; } = string.Empty;

    /// <inheritdoc/>
    public override string MessageKey => MessageKeyValue;

    /// <inheritdoc/>
    public override IDictionary<string, object?> Extensions =>
        new Dictionary<string, object?> { ["fileName"] = FileName };

    /// <summary>
    /// The exception for a name the log run already holds.
    /// </summary>
    /// <param name="fileName">The name that is taken.</param>
    /// <returns>The exception to throw.</returns>
    public static LogFileNameTakenException For(string fileName) =>
        new($"A file named '{fileName}' already exists in this log run.") { FileName = fileName };

    /// <summary>
    /// Initializes a new instance of the <see cref="LogFileNameTakenException"/> class.
    /// </summary>
    public LogFileNameTakenException()
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="LogFileNameTakenException"/> class.
    /// </summary>
    /// <param name="message">The failure, for the log rather than the user.</param>
    public LogFileNameTakenException(string message)
        : base(message)
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="LogFileNameTakenException"/> class.
    /// </summary>
    /// <param name="message">The failure, for the log rather than the user.</param>
    /// <param name="innerException">The failure this was raised for.</param>
    public LogFileNameTakenException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
