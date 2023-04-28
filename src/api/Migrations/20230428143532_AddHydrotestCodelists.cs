using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class AddHydrotestCodelists : Migration
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
                                    15203170, 001,
                                    'htest101', '',
                                    'Pump-/Injektionsversuch, konstante Rate', '',
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
                                    15203171, 002,
                                    'htest101', '',
                                    'Pump-/Injektionsversuch, stufenweise konstante Rate', '',
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
                                    15203172, 003,
                                    'htest101', '',
                                    'Pump-/Injektionsversuch, variable Rate', '',
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
                                    15203173, 004,
                                    'htest101', '',
                                    'Pump-/Injektionsversuch, konstante Druckhöhe', '',
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
                                    15203174, 005,
                                    'htest101', '',
                                    'schlagartige Änderung der Druckhöhe (Slug/Bail, Pulse)', '',
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
                                    15203175, 006,
                                    'htest101', '',
                                    'Druckerholung im offenen Bohrloch/Gestänge/Piezometer', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    6, NULL,
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
                                    15203176, 007,
                                    'htest101', '',
                                    'Druckerholung im geschlossenen Interval', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    7, NULL,
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
                                    15203177, 008,
                                    'htest101', '',
                                    'Wasserdruckversuch (Drillstem, Lugeon)', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    8, NULL,
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
                                    15203178, 009,
                                    'htest101', '',
                                    'Flowmeter- / Fluid-Logging-Versuch', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    9, NULL,
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
                                    15203179, 010,
                                    'htest101', '',
                                    'Infiltrationsversuch, ungesättigte Zone', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    10, NULL,
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
                                    15203180, 011,
                                    'htest101', '',
                                    'Kornverteilungsanalyse', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    11, NULL,
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
                                    15203181, 012,
                                    'htest101', '',
                                    'Laborversuch (Durchströmungsversuch)', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    12, NULL,
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
                                    15203182, 013,
                                    'htest101', '',
                                    'gutachterlicher Wert', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    13, NULL,
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
                                    15203183, 014,
                                    'htest101', '',
                                    'unbekannt', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    14, NULL,
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
                                    15203184, 015,
                                    'htest101', '',
                                    'andere', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    15, NULL,
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
                                    15203185, 016,
                                    'htest101', '',
                                    'keine Angaben', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    16, NULL,
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
                                    15203186, 001,
                                    'htest102', '',
                                    'Injektion', '',
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
                                    15203187, 002,
                                    'htest102', '',
                                    'Entnahme', '',
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
                                    15203188, 003,
                                    'htest102', '',
                                    'keine Angaben', '',
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
                                    15203189, 001,
                                    'htest103', '',
                                    'stationär', '',
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
                                    15203190, 002,
                                    'htest103', '',
                                    'instationär', '',
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
                                    15203191, 003,
                                    'htest103', '',
                                    'numerisch', '',
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
                                    15203192, 004,
                                    'htest103', '',
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
                                    15203193, 005,
                                    'htest103', '',
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
                                    15203194, 001,
                                    'htestres101', '',
                                    'kf-Wert (gesättigt)', '',
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
                                    15203195, 002,
                                    'htestres101', '',
                                    'kf,u-Wert (ungesättigt)', '',
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
                                    15203196, 003,
                                    'htestres101', '',
                                    'Transmissivität', '',
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
                                    15203197, 004,
                                    'htestres101', '',
                                    'Strömungsdimension', '',
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
                                    15203198, 005,
                                    'htestres101', '',
                                    'statischer Formationsdruck', '',
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
                                    15203199, 006,
                                    'htestres101', '',
                                    'spezifischer Speicherkoeffizient', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    6, NULL,
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
                                    15203200, 007,
                                    'htestres101', '',
                                    'Lugeon-Wert', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    7, NULL,
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
                                    15203201, 008,
                                    'htestres101', '',
                                    'relevante Mächtigkeit', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    8, NULL,
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
                                    15203202, 009,
                                    'htestres101', '',
                                    'keine Angaben', '',
                                    '', '',
                                    '', '',
                                    '', '',
                                    9, NULL,
                                    False, ''
                                );");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
