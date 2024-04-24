using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'hydrotest_kind' attached to a <see cref="Models.Hydrotest"/>.
/// </summary>
[Table("hydrotest_kind_codelist")]
public class HydrotestKindCode : IHydrotestCode
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
