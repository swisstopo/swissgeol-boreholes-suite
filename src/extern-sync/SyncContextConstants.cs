using Npgsql;

namespace BDMS.ExternSync;

/// <summary>
/// <see cref="SyncContext"/> constants.
/// </summary>
public static class SyncContextConstants
{
    /// <summary>
    /// The name of the source <see cref="BdmsContext"/>.
    /// </summary>
    /// <remarks>
    /// This identifier is used to register multiple <see cref="NpgsqlConnection"/>
    /// services with different connection strings.
    /// </remarks>
    public const string SourceBdmsContextName = "SourceBdmsContext";

    /// <summary>
    /// The name of the target <see cref="BdmsContext"/>.
    /// </summary>
    /// <remarks>
    /// This identifier is used to register multiple <see cref="NpgsqlConnection"/>
    /// services with different connection strings.
    /// </remarks>
    public const string TargetBdmsContextName = "TargetBdmsContext";
}
