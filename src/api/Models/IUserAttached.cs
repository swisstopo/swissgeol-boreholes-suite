namespace BDMS.Models;

/// <summary>
/// An object which has an attached <see cref="User"/> and <see cref="User.Id"/>.
/// Use <typeparamref name="TUser"/> and <typeparamref name="TUserId"/> to specify the expected types.
/// This is necessary, because some entities have <see cref="Nullable"/> properties and others don't.
/// </summary>
/// <typeparam name="TUser">The expected type for the <see cref="User"/> property.</typeparam>
/// <typeparam name="TUserId">The expected type for the <see cref="User.Id"/> property.</typeparam>
public interface IUserAttached<TUser, TUserId>
{
    /// <summary>
    /// Gets or sets the <see cref="User"/>.
    /// </summary>
    public TUser User { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User.Id"/>.
    /// </summary>
    public TUserId UserId { get; set; }
}
