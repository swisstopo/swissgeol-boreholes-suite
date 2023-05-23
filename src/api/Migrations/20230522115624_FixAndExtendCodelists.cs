using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class FixAndExtendCodelists : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            DELETE FROM bdms.codelist
            WHERE id_cli BETWEEN 15203180 AND 15203183;

            UPDATE bdms.codelist
            SET text_cli_de = REPLACE(text_cli_de, 'keine Angaben', 'keine Angabe')
            WHERE text_cli_de LIKE '%keine Angaben%';

            INSERT INTO bdms.codelist(
                   id_cli, geolcode, schema_cli, code_cli, text_cli_de, description_cli_de, text_cli_fr, description_cli_fr, text_cli_it,
                    description_cli_it, text_cli_en, description_cli_en, order_cli, conf_cli, default_cli, path_cli
                   ) VALUES
                   (15104448, 15104448, 'custom.lithology_top_bedrock', '', 'keine Angabe', '', 'sans indication', '', 'senza indicazioni', '', 'not specified', '', 355, NULL, False, ''),
                   (22115006, 22115006, 'custom.qt_depth', '', 'keine Angabe', '', 'sans indication', '', 'senza indicazioni', '', 'not specified', '', 6, NULL, False, ''),
                   (20101005, 20101005, 'kind', '', 'keine Angabe', '', 'sans indication', '', 'senza indicazioni', '', 'not specified', '', 5, NULL, False, ''),
                   (21112026, 21112026, 'mlpr112', '', 'keine Angabe', '', 'sans indication', '', 'senza indicazioni', '', 'not specified', '', 24, NULL, False, ''),
                   (9005, 9005, 'qt_description', '', 'keine Angabe', '', 'sans indication', '', 'senza indicazioni', '', 'not specified', '', 6, NULL, False, ''),
                   (20114007, 20114007, 'qt_elevation', '', 'keine Angabe', '', 'sans indication', '', 'senza indicazioni', '', 'not specified', '', 7, NULL, False, ''),
                   (20113007, 20113007, 'qt_location', '', 'keine Angabe', '', 'sans indication', '', 'senza indicazioni', '', 'not specified', '', 7, NULL, False, ''),
                   (20111004, 20111004, 'restriction', '', 'keine Angaben', '', 'sans indication', '', 'senza indicazioni', '', 'not specified', '', 4, NULL, False, '');");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
