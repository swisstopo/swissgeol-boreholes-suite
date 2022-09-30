using BDMS.Models;

namespace BDMS.Authentication;

/// <summary>
/// Authorization policy names.
/// </summary>
public static class PolicyNames
{
    /// <summary>
    /// Users with <see cref="User.IsAdmin"/> set to <c>true</c>.
    /// </summary>
    public const string Admin = "Admin";

    /// <summary>
    /// Users with <see cref="User.IsViewer"/> set to <c>true</c>.
    /// </summary>
    public const string Viewer = "Viewer";

    /// <summary>
    /// Users logged in with the default guest account.
    /// </summary>
    public const string Guest = "Guest";
}
