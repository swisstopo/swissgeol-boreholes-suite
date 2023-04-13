using BDMS.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS;

/// <summary>
/// Represents an water ingress observation in the boring process.
/// </summary>
public class WaterIngress : Observation
{
    /// <summary>
    /// Gets or sets the <see cref="WaterIngress"/>'s quantity id.
    /// </summary>
    [Column("quantity")]
    public int QuantityId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="WaterIngress"/>'s quantity.
    /// </summary>
    public Codelist Quantity { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="WaterIngress"/>'s conditions id.
    /// </summary>
    [Column("conditions")]
    public int? ConditionsId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="WaterIngress"/>'s conditions.
    /// </summary>
    public Codelist? Conditions { get; set; }
}
