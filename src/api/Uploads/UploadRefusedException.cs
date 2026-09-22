namespace BDMS.Uploads;

/// <summary>
/// An upload refused for a reason the user can put right, such as a name already taken.
///
/// A tus request carries no body of its own to explain itself, so the middleware turns this into
/// the problem response the client reads a reason out of. Anything that is not one of these is a
/// failure the user cannot act on and is not described to them.
/// </summary>
public abstract class UploadRefusedException : Exception
{
    /// <summary>
    /// Initializes a new instance of the <see cref="UploadRefusedException"/> class.
    /// </summary>
    protected UploadRefusedException()
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="UploadRefusedException"/> class.
    /// </summary>
    /// <param name="message">What was refused.</param>
    protected UploadRefusedException(string message)
        : base(message)
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="UploadRefusedException"/> class.
    /// </summary>
    /// <param name="message">What was refused.</param>
    /// <param name="innerException">The failure this was raised for.</param>
    protected UploadRefusedException(string message, Exception innerException)
        : base(message, innerException)
    {
    }

    /// <summary>Gets the key the client translates the reason with.</summary>
    public abstract string MessageKey { get; }

    /// <summary>Gets the values the translated message needs, carried in the problem response.</summary>
    public virtual IDictionary<string, object?> Extensions => new Dictionary<string, object?>();
}
