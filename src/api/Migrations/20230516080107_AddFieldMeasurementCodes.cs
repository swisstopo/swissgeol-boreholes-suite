using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class AddFieldMeasurementCodes : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"INSERT INTO bdms.codelist(
                                id_cli, geolcode, schema_cli, code_cli, text_cli_de, description_cli_de, text_cli_fr, description_cli_fr, text_cli_it,
                                description_cli_it, text_cli_en, description_cli_en, order_cli, conf_cli, default_cli, path_cli
                                ) VALUES
                                (15203209, 001, 'field101', '', 'Pumpprobe', '', 'pompé', '', 'pompato', '', 'pumped', '', 1, NULL, False, ''),
                                (15203210, 002, 'field101', '', 'Schöpfprobe', '', 'simple (échantillonneur/becher)', '', 'campionamento senza pompaggio', '', 'scooped', '', 2, NULL, False, ''),
                                (15203211, 003, 'field101', '', 'im Bohrloch', '', 'dans le forage', '', 'in foro', '', 'in the borehole (in situ)', '', 3, NULL, False, ''),
                                (15203212, 004, 'field101', '', 'andere', '', 'autre', '', 'altro', '', 'other', '', 4, NULL, False, ''),
                                (15203213, 005, 'field101', '', 'keine Angaben', '', 'sans indication', '', 'senza indicazioni', '', 'not specified', '', 5, NULL, False, ''),
                                (15203214, 001, 'field102', '', 'Temperatur', '', 'température', '', 'temperatura', '', 'temperature', '', 1, NULL, False, ''),
                                (15203215, 002, 'field102', '', 'pH-Wert', '', 'valeur du pH', '', 'valore pH', '', 'pH value', '', 2, NULL, False, ''),
                                (15203216, 003, 'field102', '', 'elektrische Leitfähigkeit (20 °C)', '', 'conductivité électrique (ref. 20°C)', '', 'conducibilità elettrica (ref. 20°C)', '', 'electrical conductivity (ref. 20°C)', '', 3, NULL, False, ''),
                                (15203217, 004, 'field102', '', 'elektrische Leitfähigkeit (25 °C)', '', 'conductivité électrique (ref. 25°C)', '', 'conducibilità elettrica (ref. 25°C)', '', 'electrical conductivity (ref. 25°C)', '', 4, NULL, False, ''),
                                (15203218, 005, 'field102', '', 'Redoxpotenzial', '', 'potentiel redox', '', 'potenziale redox', '', 'redox potential', '', 5, NULL, False, ''),
                                (15203219, 006, 'field102', '', 'Sauerstoffsättigung', '', 'saturation en oxygène', '', 'saturazione ossigeno', '', 'oxygen saturation', '', 6, NULL, False, ''),
                                (15203220, 007, 'field102', '', 'Sauerstoffgehalt gelöst', '', 'teneur en oxygène dissous', '', 'contenuto di ossigeno disciolto', '', 'dissolved oxygen', '', 7, NULL, False, ''),
                                (15203221, 008, 'field102', '', 'andere', '', 'autre', '', 'altro', '', 'other', '', 8, NULL, False, ''),
                                (15203222, 009, 'field102', '', 'keine Angaben', '', 'sans indication', '', 'senza indicazioni', '', 'not specified', '', 9, NULL, False, '');");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
