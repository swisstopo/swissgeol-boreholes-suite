using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class MigrateBoreholeStratigraphyCodes : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            UPDATE bdms.borehole b
            SET lithology_top_bedrock_id_cli = (
                SELECT c2.id_cli
                FROM bdms.codelist c1
                JOIN bdms.codelist c2
                  ON c1.geolcode = c2.geolcode
                WHERE c1.id_cli = b.lithology_top_bedrock_id_cli
                  AND c1.schema_cli = 'custom.lithology_top_bedrock'
                  AND c2.schema_cli = 'lithology_con'
            )
            WHERE EXISTS (
                SELECT 1
                FROM bdms.codelist c1
                WHERE c1.id_cli = b.lithology_top_bedrock_id_cli
                  AND c1.schema_cli = 'custom.lithology_top_bedrock'
            );

            UPDATE bdms.borehole b
            SET lithostrat_id_cli = (
                SELECT c2.id_cli
                FROM bdms.codelist c1
                JOIN bdms.codelist c2
                  ON c1.geolcode = c2.geolcode
                WHERE c1.id_cli = b.lithostrat_id_cli
                  AND c1.schema_cli = 'custom.lithostratigraphy_top_bedrock'
                  AND c2.schema_cli = 'lithostratigraphy'
            )
            WHERE EXISTS (
                SELECT 1
                FROM bdms.codelist c1
                WHERE c1.id_cli = b.lithostrat_id_cli
                  AND c1.schema_cli = 'custom.lithostratigraphy_top_bedrock'
            );

            UPDATE bdms.borehole b
            SET chronostrat_id_cli = (
                SELECT c2.id_cli
                FROM bdms.codelist c1
                JOIN bdms.codelist c2
                  ON c1.geolcode = c2.geolcode
                WHERE c1.id_cli = b.chronostrat_id_cli
                  AND c1.schema_cli = 'custom.chronostratigraphy_top_bedrock'
                  AND c2.schema_cli = 'chronostratigraphy'
            )
            WHERE EXISTS (
                SELECT 1
                FROM bdms.codelist c1
                WHERE c1.id_cli = b.chronostrat_id_cli
                  AND c1.schema_cli = 'custom.chronostratigraphy_top_bedrock'
            );
        ");
    }
}
#pragma warning restore CA1505
