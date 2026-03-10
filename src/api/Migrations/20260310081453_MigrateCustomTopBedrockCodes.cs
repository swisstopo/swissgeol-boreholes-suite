using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class MigrateCustomTopBedrockCodes : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            UPDATE bdms.lithostratigraphy b
            SET lithostratigraphy_id = c2.id_cli
            FROM bdms.codelist c1
            JOIN bdms.codelist c2
                ON c1.geolcode = c2.geolcode
            WHERE b.lithostratigraphy_id = c1.id_cli
                AND c1.schema_cli = 'custom.lithostratigraphy_top_bedrock'
                AND c2.schema_cli = 'lithostratigraphy';

            UPDATE bdms.borehole b
            SET lithostrat_id_cli = c2.id_cli
            FROM bdms.codelist c1
            JOIN bdms.codelist c2
                ON c1.geolcode = c2.geolcode
            WHERE b.lithostrat_id_cli = c1.id_cli
                AND c1.schema_cli = 'custom.lithostratigraphy_top_bedrock'
                AND c2.schema_cli = 'lithostratigraphy';

            UPDATE bdms.chronostratigraphy b
            SET chronostratigraphy_id = c2.id_cli
            FROM bdms.codelist c1
            JOIN bdms.codelist c2
                ON c1.geolcode = c2.geolcode
            WHERE b.chronostratigraphy_id = c1.id_cli
                AND c1.schema_cli = 'custom.chronostratigraphy_top_bedrock'
                AND c2.schema_cli = 'chronostratigraphy';

            UPDATE bdms.borehole b
            SET chronostrat_id_cli = c2.id_cli
            FROM bdms.codelist c1
            JOIN bdms.codelist c2
                ON c1.geolcode = c2.geolcode
            WHERE b.chronostrat_id_cli = c1.id_cli
                AND c1.schema_cli = 'custom.chronostratigraphy_top_bedrock'
                AND c2.schema_cli = 'chronostratigraphy';

            DELETE FROM bdms.codelist
            WHERE schema_cli IN ('custom.lithostratigraphy_top_bedrock', 'custom.chronostratigraphy_top_bedrock');
        ");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
