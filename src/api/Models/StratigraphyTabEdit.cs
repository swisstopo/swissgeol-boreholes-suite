namespace BDMS.Models;

/// <summary>
/// A single combined edit of a <see cref="Stratigraphy"/> together with the contents of one of its tabs.
/// Used by the combined stratigraphy create/update endpoints both as the request payload and as the
/// response, so that the stratigraphy header and the active tab's content are persisted (and returned)
/// in one transactional command. A header-only edit (e.g. creating an empty stratigraphy) leaves
/// <see cref="LithologyTab"/> <c>null</c>. Only the lithology tab is implemented for now; further tabs
/// (chronostratigraphy, lithostratigraphy) can add their own slots later.
/// </summary>
public class StratigraphyTabEdit
{
    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/> header. An <see cref="IIdentifyable.Id"/> of zero
    /// creates a new stratigraphy.
    /// </summary>
    public Stratigraphy Stratigraphy { get; set; } = null!;

    /// <summary>
    /// Gets or sets the contents of the Lithology tab, or <c>null</c> when this edit does not touch it.
    /// </summary>
    public LithologyTabContents? LithologyTab { get; set; }
}
