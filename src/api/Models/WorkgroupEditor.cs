namespace BDMS.Models;

/// <summary>
/// Represents a <see cref="User"/> with only minimal information, to be returned from a <see cref="BDMS.Controllers.UserController.GetWorkgroupEditors"/> request.
/// </summary>
public class WorkgroupEditor
{

    /// <summary>
    /// Gets or sets the <see cref="WorkgroupEditor"/>s name.
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="WorkgroupEditor"/>s firstname.
    /// </summary>
    public string FirstName { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="WorkgroupEditor"/>s lastname.
    /// </summary>
    public string LastName { get; set; }

    /// <summary>
    /// Gets the WorkgroupRoles.
    /// </summary>
    public ICollection<UserWorkgroupRole> WorkgroupRoles { get; } = new List<UserWorkgroupRole>();

    public WorkgroupEditor(User user)
    {
        Name = user.Name;
        FirstName = user.FirstName;
        LastName = user.LastName;
        WorkgroupRoles = new List<UserWorkgroupRole>(user.WorkgroupRoles);
    }
}
