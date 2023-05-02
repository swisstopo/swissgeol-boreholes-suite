namespace BDMS.Models;

/// <summary>
/// Represents a the borehole file's updateable properties.
/// </summary>
/// <remarks>Extend this class with any additional updatable properties of the borehole file.</remarks>
/// <seealso cref="Borehole"/>
public class BoreholeFileUpdate
{
    /// <summary>
    /// Gets or sets the <see cref="BoreholeFileUpdate"/>'s description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="BoreholeFileUpdate"/>'s public.
    /// </summary>
    public bool? Public { get; set; }
}
