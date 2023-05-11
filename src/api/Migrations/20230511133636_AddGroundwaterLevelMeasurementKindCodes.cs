using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class AddGroundwaterLevelMeasurementKindCodes : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"INSERT INTO bdms.codelist(
                                id_cli, geolcode, schema_cli, code_cli, text_cli_de, description_cli_de, text_cli_fr, description_cli_fr, text_cli_it,
                                description_cli_it, text_cli_en, description_cli_en, order_cli, conf_cli, default_cli, path_cli
                                ) VALUES
                                (15203203, 001, 'gwlme101', '', 'Lichtlot', '', '', '', '', '', '', '', 4, NULL, False, ''),
                                (15203204, 002, 'gwlme101', '', 'Drucksonde', '', '', '', '', '', '', '', 5, NULL, False, ''),
                                (15203205, 003, 'gwlme101', '', 'Manometer', '', '', '', '', '', '', '', 6, NULL, False, ''),
                                (15203206, 004, 'gwlme101', '', 'Schall', '', '', '', '', '', '', '', 7, NULL, False, ''),
                                (15203207, 005, 'gwlme101', '', 'andere', '', '', '', '', '', '', '', 8, NULL, False, ''),
                                (15203208, 006, 'gwlme101', '', 'keine Angaben', '', '', '', '', '', '', '', 9, NULL, False, '');");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
