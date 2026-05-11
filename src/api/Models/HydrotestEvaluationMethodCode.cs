using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'hydrotest_evaluationmethod' attached to a <see cref="Models.Hydrotest"/>.
/// </summary>
[Table("hydrotest_evaluationmethod_codelist")]
public class HydrotestEvaluationMethodCode : IHydrotestCode
{
    /// <inheritdoc/>
    [Column("hydrotest_id")]
    [Required]
    public int HydrotestId { get; set; }

    /// <inheritdoc/>
    public Hydrotest Hydrotest { get; set; }

    /// <inheritdoc/>
    [Column("codelist_id")]
    [Required]
    public int CodelistId { get; set; }

    /// <inheritdoc/>
    public Codelist Codelist { get; set; }
}
