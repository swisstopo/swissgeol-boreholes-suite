﻿using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'grain_angularity' attached to a <see cref="Models.Layer"/>.
/// </summary>
[Table("layer_grain_angularity_codelist")]
public class LayerGrainAngularityCode : ILayerCode
{
    /// <inheritdoc/>
    [Column("id_lay_fk")]
    public int LayerId { get; set; }

    /// <inheritdoc/>
    public Layer Layer { get; set; }

    /// <inheritdoc/>
    [Column("id_cli_fk")]
    public int CodelistId { get; set; }

    /// <inheritdoc/>
    public Codelist Codelist { get; set; }
}
