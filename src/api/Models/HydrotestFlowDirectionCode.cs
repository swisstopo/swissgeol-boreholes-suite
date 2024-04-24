using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'hydrotest_flowdirection' attached to a <see cref="Models.Hydrotest"/>.
/// </summary>
[Table("hydrotest_flowdirection_codelist")]
public class HydrotestFlowDirectionCode : IHydrotestCode
{
    /// <inheritdoc/>
    [Column("hydrotest_id")]
    public int HydrotestId { get; set; }

    /// <inheritdoc/>
    public Hydrotest Hydrotest { get; set; }

    /// <inheritdoc/>
    [Column("codelist_id")]
    public int CodelistId { get; set; }

    /// <inheritdoc/>
    public Codelist Codelist { get; set; }
}
