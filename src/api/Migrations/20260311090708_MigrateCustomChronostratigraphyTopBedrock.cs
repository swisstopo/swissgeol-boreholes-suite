using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class MigrateCustomChronostratigraphyTopBedrock : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            UPDATE bdms.chronostratigraphy b
            SET chronostratigraphy_id = c1.id_cli
            FROM bdms.codelist c1
            JOIN bdms.codelist c2
                ON c1.geolcode = c2.geolcode
            WHERE b.chronostratigraphy_id = c2.id_cli
                AND c1.schema_cli = 'custom.chronostratigraphy_top_bedrock'
                AND c2.schema_cli = 'chronostratigraphy';

            UPDATE bdms.borehole b
            SET chronostrat_id_cli = c1.id_cli
            FROM bdms.codelist c1
            JOIN bdms.codelist c2
                ON c1.geolcode = c2.geolcode
            WHERE b.chronostrat_id_cli = c2.id_cli
                AND c1.schema_cli = 'custom.chronostratigraphy_top_bedrock'
                AND c2.schema_cli = 'chronostratigraphy';

            INSERT INTO bdms.codelist(
                id_cli, geolcode, schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli, conf_cli, default_cli, path_cli
            ) VALUES
                (15001155, 15001155, 'custom.chronostratigraphy_top_bedrock', '', 'Domerian', 'Domérien', 'Domérien', 'Domeriano', 771, '{""color"":[128,197,221]}', false, '15001001.15001049.15001065.15001075.0.15001077.15001155'),
                (15001156, 15001156, 'custom.chronostratigraphy_top_bedrock', '', 'Carixian', 'Carixien', 'Carixien', 'Carixiano', 772, '{""color"":[128,197,221]}', false, '15001001.15001049.15001065.15001075.0.15001077.15001156'),
                (15001154, 15001154, 'custom.chronostratigraphy_top_bedrock', '', 'Hadean', 'Hadaikum', 'Hadéen', 'Adeano', 1530, '{""color"":[174,2,126]}', false, '15001154');

            UPDATE bdms.codelist SET conf_cli = '{""color"":[255,242,20]}' WHERE id_cli = 30000312;
            UPDATE bdms.codelist SET conf_cli = '{""color"":[255,242,195]}' WHERE id_cli = 30000313;
            UPDATE bdms.codelist SET text_cli_fr = 'Priabonien tardif' WHERE id_cli = 15001036;
            UPDATE bdms.codelist SET text_cli_it = 'Tardo Priaboniano' WHERE id_cli = 15001038;
            UPDATE bdms.codelist SET conf_cli = '{""color"":[253,180,130]}' WHERE id_cli = 15001040;
            UPDATE bdms.codelist SET conf_cli = '{""color"":[253,167,115]}' WHERE id_cli = 15001043;
            UPDATE bdms.codelist SET text_cli_it = 'Cretacico' WHERE id_cli = 15001050;
            UPDATE bdms.codelist SET text_cli_it = 'Tardo Cretacico' WHERE id_cli = 15001051;
            UPDATE bdms.codelist SET text_cli_it = 'Primo Cretaccio' WHERE id_cli = 15001058;

            DELETE FROM bdms.codelist WHERE schema_cli = 'chronostratigraphy';
            UPDATE bdms.codelist SET schema_cli = 'chronostratigraphy' WHERE schema_cli = 'custom.chronostratigraphy_top_bedrock';
            UPDATE bdms.codelist SET code_cli = '' WHERE schema_cli = 'chronostratigraphy';
        ");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
