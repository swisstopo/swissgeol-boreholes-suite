using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class MigrateUnconsolidatedProperties : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            UPDATE bdms.lithology_description
            SET
                creation = l.creation,
                creator = l.creator,
                update = l.update,
                updater = l.updater
            FROM bdms.lithology l
            WHERE bdms.lithology_description.lithology_id = l.id;

            UPDATE bdms.lithology_description
            SET striae = COALESCE(l.striae_lay, false)
            FROM bdms.layer l
            WHERE bdms.lithology_description.lithology_id = l.id_lay;

            INSERT INTO bdms.lithology_description_component_uncon_organic_codelist (
                lithology_description_id,
                component_uncon_organic_id
            )
            SELECT
                ld.id,
                loc.organic_components_id
            FROM bdms.layer_organic_component_codelist loc
            JOIN bdms.lithology_description ld ON ld.lithology_id = loc.layer_id;

            INSERT INTO bdms.lithology_description_component_uncon_debris_codelist (
                lithology_description_id,
                component_uncon_debris_id
            )
            SELECT
                ld.id,
                ldc.debris_id
            FROM bdms.layer_debris_codelist ldc
            JOIN bdms.lithology_description ld ON ld.lithology_id = ldc.layer_id;

            INSERT INTO bdms.lithology_description_grain_shape_codelist (
                lithology_description_id,
                grain_shape_id
            )
            SELECT
                ld.id,
                lgsc.grain_shape_id
            FROM bdms.layer_grain_shape_codelist lgsc
            JOIN bdms.lithology_description ld ON ld.lithology_id = lgsc.layer_id;

            INSERT INTO bdms.lithology_description_grain_angularity_codelist (
                lithology_description_id,
                grain_angularity_id
            )
            SELECT
                ld.id,
                lgac.grain_angularity_id
            FROM bdms.layer_grain_angularity_codelist lgac
            JOIN bdms.lithology_description ld ON ld.lithology_id = lgac.layer_id;
        ");
    }
}
#pragma warning restore CA1505
