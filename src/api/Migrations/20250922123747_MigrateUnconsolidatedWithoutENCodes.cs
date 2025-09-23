using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class MigrateUnconsolidatedWithoutENCodes : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            INSERT INTO bdms.lithology (
                id,
                stratigraphy_id,
                creation,
                creator,
                update,
                updater,
                depth_from,
                depth_to,
                unconsolidated,
                notes,
                compactness_id,
                cohesion_id,
                humidity_id,
                consistency_id,
                plasticity_id,
                uscs_determination_id
            )
            SELECT
                id_lay,
                id_sty_fk,
                creation_lay,
                creator_lay,
                update_lay,
                updater_lay,
                depth_from_lay,
                depth_to_lay,
                TRUE,
                notes_lay,
                compactness_id_cli,
                cohesion_id_cli,
                humidity_id_cli,
                consistance_id_cli,
                plasticity_id_cli,
                uscs_determination_id_cli
            FROM bdms.layer
            WHERE id_sty_fk IN (SELECT id FROM bdms.stratigraphy_v2) AND lithology_id_cli=15104769 AND id_lay NOT IN (SELECT id FROM bdms.lithology);

            INSERT INTO bdms.lithology_description (lithology_id)
            SELECT id
            FROM bdms.lithology
            WHERE id NOT IN (
              SELECT lithology_id FROM bdms.lithology_description
            );
        ");
    }
}
#pragma warning restore CA1505
