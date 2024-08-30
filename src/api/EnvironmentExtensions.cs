namespace BDMS;

/// <summary>
/// Provides extension methods for the <see cref="Environment"/> class.
/// </summary>
internal class EnvironmentExtensions
{
    /// <summary>
    /// Checks if anonymous mode is enabled.
    /// </summary>
    /// <returns></returns>
    internal static bool IsAnonymousModeEnabled()
        => bool.TryParse(Environment.GetEnvironmentVariable("ANONYMOUS_MODE_ENABLED"), out bool anonymousModeEnabled) && anonymousModeEnabled;
}
