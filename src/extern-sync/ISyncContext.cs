namespace BDMS.ExternSync;

/// <summary>
/// Represents a boreholes sync context containing a source and
/// a target database <see cref="BdmsContext">.
/// </summary>
public interface ISyncContext
{
    /// <summary>
    /// The source database context.
    /// </summary>
    BdmsContext Source { get; }

    /// <summary>
    /// The target database context.
    /// </summary>
    BdmsContext Target { get; }
}
