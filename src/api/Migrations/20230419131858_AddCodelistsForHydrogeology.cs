using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class AddCodelistsForHydrogeology : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"INSERT INTO bdms.codelist (
                                    id_cli, geolcode,
                                    schema_cli, code_cli,
                                    text_cli_de, description_cli_de,
                                    text_cli_fr, description_cli_fr,
                                    text_cli_it, description_cli_it,
                                    text_cli_en, description_cli_en,
                                    order_cli, conf_cli,
                                    default_cli, path_cli
                                ) VALUES (
                                    15203156, 001,
                                    'observ101', '',
                                    'zuverlässig', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    1, NULL,
                                    False, ''
                                );
                                INSERT INTO bdms.codelist (
                                    id_cli, geolcode,
                                    schema_cli, code_cli,
                                    text_cli_de, description_cli_de,
                                    text_cli_fr, description_cli_fr,
                                    text_cli_it, description_cli_it,
                                    text_cli_en, description_cli_en,
                                    order_cli, conf_cli,
                                    default_cli, path_cli
                                ) VALUES (
                                    15203157, 002,
                                    'observ101', '',
                                    'fraglich', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    2, NULL,
                                    False, ''
                                );
                                INSERT INTO bdms.codelist (
                                    id_cli, geolcode,
                                    schema_cli, code_cli,
                                    text_cli_de, description_cli_de,
                                    text_cli_fr, description_cli_fr,
                                    text_cli_it, description_cli_it,
                                    text_cli_en, description_cli_en,
                                    order_cli, conf_cli,
                                    default_cli, path_cli
                                ) VALUES (
                                    15203158, 003,
                                    'observ101', '',
                                    'unbekannt', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    3, NULL,
                                    False, ''
                                );
                                INSERT INTO bdms.codelist (
                                    id_cli, geolcode,
                                    schema_cli, code_cli,
                                    text_cli_de, description_cli_de,
                                    text_cli_fr, description_cli_fr,
                                    text_cli_it, description_cli_it,
                                    text_cli_en, description_cli_en,
                                    order_cli, conf_cli,
                                    default_cli, path_cli
                                ) VALUES (
                                    15203159, 004,
                                    'observ101', '',
                                    'keine Angaben', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    4, NULL,
                                    False, ''
                                );
                                INSERT INTO bdms.codelist (
                                    id_cli, geolcode,
                                    schema_cli, code_cli,
                                    text_cli_de, description_cli_de,
                                    text_cli_fr, description_cli_fr,
                                    text_cli_it, description_cli_it,
                                    text_cli_en, description_cli_en,
                                    order_cli, conf_cli,
                                    default_cli, path_cli
                                ) VALUES (
                                    15203160, 001,
                                    'waing101', '',
                                    'wenig (< 30 l/min)', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    1, NULL,
                                    False, ''
                                );
                                INSERT INTO bdms.codelist (
                                    id_cli, geolcode,
                                    schema_cli, code_cli,
                                    text_cli_de, description_cli_de,
                                    text_cli_fr, description_cli_fr,
                                    text_cli_it, description_cli_it,
                                    text_cli_en, description_cli_en,
                                    order_cli, conf_cli,
                                    default_cli, path_cli
                                ) VALUES (
                                    15203161, 002,
                                    'waing101', '',
                                    'mittel (30 - 120 l/min)', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    2, NULL,
                                    False, ''
                                );
                                INSERT INTO bdms.codelist (
                                    id_cli, geolcode,
                                    schema_cli, code_cli,
                                    text_cli_de, description_cli_de,
                                    text_cli_fr, description_cli_fr,
                                    text_cli_it, description_cli_it,
                                    text_cli_en, description_cli_en,
                                    order_cli, conf_cli,
                                    default_cli, path_cli
                                ) VALUES (
                                    15203162, 003,
                                    'waing101', '',
                                    'viel (> 120 l/min)', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    3, NULL,
                                    False, ''
                                );
                                INSERT INTO bdms.codelist (
                                    id_cli, geolcode,
                                    schema_cli, code_cli,
                                    text_cli_de, description_cli_de,
                                    text_cli_fr, description_cli_fr,
                                    text_cli_it, description_cli_it,
                                    text_cli_en, description_cli_en,
                                    order_cli, conf_cli,
                                    default_cli, path_cli
                                ) VALUES (
                                    15203163, 004,
                                    'waing101', '',
                                    'unbekannt', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    4, NULL,
                                    False, ''
                                );
                                INSERT INTO bdms.codelist (
                                    id_cli, geolcode,
                                    schema_cli, code_cli,
                                    text_cli_de, description_cli_de,
                                    text_cli_fr, description_cli_fr,
                                    text_cli_it, description_cli_it,
                                    text_cli_en, description_cli_en,
                                    order_cli, conf_cli,
                                    default_cli, path_cli
                                ) VALUES (
                                    15203164, 005,
                                    'waing101', '',
                                    'keine Angaben', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    5, NULL,
                                    False, ''
                                );
                                INSERT INTO bdms.codelist (
                                    id_cli, geolcode,
                                    schema_cli, code_cli,
                                    text_cli_de, description_cli_de,
                                    text_cli_fr, description_cli_fr,
                                    text_cli_it, description_cli_it,
                                    text_cli_en, description_cli_en,
                                    order_cli, conf_cli,
                                    default_cli, path_cli
                                ) VALUES (
                                    15203165, 001,
                                    'waing102', '',
                                    'artesisch gespannt', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    1, NULL,
                                    False, ''
                                );
                                INSERT INTO bdms.codelist (
                                    id_cli, geolcode,
                                    schema_cli, code_cli,
                                    text_cli_de, description_cli_de,
                                    text_cli_fr, description_cli_fr,
                                    text_cli_it, description_cli_it,
                                    text_cli_en, description_cli_en,
                                    order_cli, conf_cli,
                                    default_cli, path_cli
                                ) VALUES (
                                    15203166, 002,
                                    'waing102', '',
                                    'gespannt', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    2, NULL,
                                    False, ''
                                );
                                INSERT INTO bdms.codelist (
                                    id_cli, geolcode,
                                    schema_cli, code_cli,
                                    text_cli_de, description_cli_de,
                                    text_cli_fr, description_cli_fr,
                                    text_cli_it, description_cli_it,
                                    text_cli_en, description_cli_en,
                                    order_cli, conf_cli,
                                    default_cli, path_cli
                                ) VALUES (
                                    15203167, 003,
                                    'waing102', '',
                                    'frei/ungespannt', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    3, NULL,
                                    False, ''
                                );
                                INSERT INTO bdms.codelist (
                                    id_cli, geolcode,
                                    schema_cli, code_cli,
                                    text_cli_de, description_cli_de,
                                    text_cli_fr, description_cli_fr,
                                    text_cli_it, description_cli_it,
                                    text_cli_en, description_cli_en,
                                    order_cli, conf_cli,
                                    default_cli, path_cli
                                ) VALUES (
                                    15203168, 004,
                                    'waing102', '',
                                    'unbekannt', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    4, NULL,
                                    False, ''
                                );
                                INSERT INTO bdms.codelist (
                                    id_cli, geolcode,
                                    schema_cli, code_cli,
                                    text_cli_de, description_cli_de,
                                    text_cli_fr, description_cli_fr,
                                    text_cli_it, description_cli_it,
                                    text_cli_en, description_cli_en,
                                    order_cli, conf_cli,
                                    default_cli, path_cli
                                ) VALUES (
                                    15203169, 005,
                                    'waing102', '',
                                    'keine Angaben', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    5, NULL,
                                    False, ''
                                );");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
