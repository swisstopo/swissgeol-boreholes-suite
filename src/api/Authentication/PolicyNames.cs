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
    /// Users with <see cref="User.IsAdmin"/> set to <c>false</c>.
    /// </summary>
    public const string Viewer = "Viewer";
}
