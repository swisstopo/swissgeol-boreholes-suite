using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

#pragma warning disable CA1707 // Identifiers should not contain underscores
public partial class MigrateTo_1_0_5 : Migration
#pragma warning restore CA1707 // Identifiers should not contain underscores
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
UPDATE
  bdms.config
SET
  value_cfg = '1.0.5'
WHERE
  name_cfg = 'VERSION';

UPDATE
  bdms.config
SET
  value_cfg = '1.0.4'
WHERE
  name_cfg = 'PREVIOUS';

UPDATE
  bdms.config
SET
  value_cfg = to_char(now(), 'YYYY-MM-DD""T""HH24:MI:SSOF')
WHERE
  name_cfg = 'PG_UPGRADE';

ALTER TABLE bdms.stratigraphy
    ADD COLUMN kind_id_cli integer;

UPDATE bdms.stratigraphy
	SET kind_id_cli=3000;

ALTER TABLE bdms.stratigraphy
    ALTER COLUMN kind_id_cli SET NOT NULL;

ALTER TABLE bdms.stratigraphy
    ADD FOREIGN KEY (kind_id_cli)
    REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

-- Adding configuration to the geological profile
UPDATE bdms.codelist SET
conf_cli=((
	'{""title"": ""lithostratigraphy_id_cli"", ""titleNS"": ""custom.lit_str_top_bedrock"", ""subtitle"": ""chronostratigraphy_id_cli"",""titleNS"": ""custom.chro_str_top_bedrock"",""text"": ""lithology_id_cli"",""textNS"": ""custom.lit_pet_top_bedrock""}'
)::jsonb || conf_cli::jsonb)::json
WHERE id_cli = 3000;


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
    25000000, 25000000,
    'casi100', '',
    'Brunnen', '',
    'puits', '',
    'pozzo', '',
    'well', '',
    1, NULL,
    false, ''
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
    25000001, 25000001,
    'casi100', '',
    'Piezometer', '',
    'piézomètre', '',
    'piezometro', '',
    'piezometer', '',
    2, NULL,
    false, ''
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
    25000002, 25000002,
    'casi100', '',
    'geothermische Tiefbohrung', '',
    'forage géothermique profond', '',
    'perforazione profonda geotermica', '',
    'geothermal deep well', '',
    3, NULL,
    false, ''
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
    25000003, 25000003,
    'casi100', '',
    'Entnahmebrunnen', '',
    'puits d''extraction', '',
    'pozzo di estrazione', '',
    'extraction well', '',
    4, NULL,
    false, ''
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
    25000004, 25000004,
    'casi100', '',
    'Rückgabebrunnen', '',
    'puits d''injection', '',
    'pozzo di iniezione', '',
    'injection well', '',
    5, NULL,
    false, ''
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
    25000005, 25000005,
    'casi100', '',
    'Erdwärmesonde', '',
    'sonde géothermique', '',
    'sonda geotermica', '',
    'geothermal heat probe', '',
    6, NULL,
    false, ''
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
    25000006, 25000006,
    'casi100', '',
    'Inclinometer', '',
    'inclinomètre', '',
    'inclinometro', '',
    'inclinometer', '',
    7, NULL,
    false, ''
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
    25000007, 25000007,
    'casi100', '',
    'anderes', '',
    'autre', '',
    'altro', '',
    'other ', '',
    8, NULL,
    false, ''
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
    25000008, 25000008,
    'casi100', '',
    'keine Angaben', '',
    'sans indication', '',
    'senza indicazioni', '',
    'not specified', '',
    9, NULL,
    false, ''
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
    25000009, 25000009,
    'casi101', '',
    'Terrainoberkante', '',
    'surface terrain naturelle', '',
    'superficie del terreno naturale', '',
    'ground surface', '',
    1, NULL,
    false, ''
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
    25000010, 25000010,
    'casi101', '',
    'Rohroberkante', '',
    'tube pièzométrique', '',
    'tubazione superiore', '',
    'top casing', '',
    2, NULL,
    false, ''
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
    25000011, 25000011,
    'casi101', '',
    'Schachtdeckel', '',
    'margelle du puits', '',
    'copertura del pozzo', '',
    'shaft cover', '',
    3, NULL,
    false, ''
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
    25000012, 25000012,
    'casi101', '',
    'Rotary Table', '',
    'Rotary table', '',
    'Rotary table', '',
    'Rotary table', '',
    4, NULL,
    false, ''
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
    25000013, 25000013,
    'casi101', '',
    'anderes', '',
    'autre', '',
    'altro', '',
    'other ', '',
    5, NULL,
    false, ''
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
    25000014, 25000014,
    'casi101', '',
    'keine Angaben', '',
    'sans indication', '',
    'senza indicazioni', '',
    'not specified', '',
    6, NULL,
    false, ''
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
    25000100, 25000100,
    'casi200', '',
    'Vollrohr', '',
    'tube plain', '',
    NULL, '',
    'blank casing', '',
    1, NULL,
    false, ''
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
    25000101, 25000101,
    'casi200', '',
    'Filterrohr', '',
    'crépine', '',
    'filtro', '',
    'screen', '',
    2, NULL,
    false, ''
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
    25000102, 25000102,
    'casi200', '',
    'Standrohr', '',
    'tube conducteur', '',
    NULL, '',
    'conductor pipe', '',
    3, NULL,
    false, ''
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
    25000103, 25000103,
    'casi200', '',
    'Bodenkappe', '',
    'couvercle inférieur', '',
    'tappo di fondo', '',
    'bottom cap', '',
    4, NULL,
    false, ''
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
    25000104, 25000104,
    'casi200', '',
    'Abdeckung', '',
    'couvercle de puits', '',
    'copertura del pozzo', '',
    'well cover', '',
    5, NULL,
    false, ''
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
    25000105, 25000105,
    'casi200', '',
    'Abdichtung', '',
    'bouchon d''étanchéité', '',
    NULL, '',
    'packing', '',
    6, NULL,
    false, ''
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
    25000106, 25000106,
    'casi200', '',
    'anderes', '',
    'autre', '',
    'altro', '',
    'other ', '',
    7, NULL,
    false, ''
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
    25000107, 25000107,
    'casi200', '',
    'keine Angaben', '',
    'sans indication', '',
    'senza indicazioni', '',
    'not specified', '',
    8, NULL,
    false, ''
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
    25000108, 25000108,
    'casi201', '',
    'PVC (Polyvinylchlorid)', '',
    'PVC (chlorure de polyvinyle)', '',
    'PVC (Polivinile cloruro)', '',
    'PVC (polyvinyl chloride)', '',
    1, NULL,
    false, ''
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
    25000109, 25000109,
    'casi201', '',
    'HDPE (Polyethylen mit hoher Dichte)', '',
    'HDPE (polyéthylène à haute densité)', '',
    'HDPE (Polietilene ad alta densità)', '',
    'HDPE (high density polyethylene', '',
    2, NULL,
    false, ''
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
    25000110, 25000110,
    'casi201', '',
    'Kunstoff unspezifiziert', '',
    'plastique non spécifié', '',
    'plastica non specificata', '',
    'plastic unspecified', '',
    3, NULL,
    false, ''
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
    25000111, 25000111,
    'casi201', '',
    'Stahl', '',
    'acier', '',
    'acciaio', '',
    'steel', '',
    4, NULL,
    false, ''
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
    25000112, 25000112,
    'casi201', '',
    'Edelstahl', '',
    'acier inoxydable', '',
    'acciaio inossidabile', '',
    'stainless steel', '',
    5, NULL,
    false, ''
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
    25000113, 25000113,
    'casi201', '',
    'Beton/Mörtel/Zement', '',
    'béton/mortier/ciment', '',
    'calcestruzzo/malta/cemento', '',
    'concrete/mortar/cement', '',
    6, NULL,
    false, ''
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
    25000114, 25000114,
    'casi201', '',
    'anderes', '',
    'autre', '',
    'altro', '',
    'other ', '',
    7, NULL,
    false, ''
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
    25000115, 25000115,
    'casi201', '',
    'keine Angaben', '',
    'sans indication', '',
    'senza indicazioni', '',
    'not specified', '',
    8, NULL,
    false, ''
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
    25000200, 25000200,
    'inst100', '',
    'Pumpe unspezifiziert', '',
    'pompe non spécifiée', '',
    'pompa non specificata', '',
    'pump unspecified', '',
    1, NULL,
    false, ''
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
    25000201, 25000201,
    'inst100', '',
    'Unterwasserpumpe', '',
    'pompe immergée', '',
    'pompa sommergibile', '',
    'submersible pump', '',
    2, NULL,
    false, ''
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
    25000202, 25000202,
    'inst100', '',
    'Saugpumpe', '',
    'pompe d''aspiration', '',
    'pompa di aspirazione', '',
    'suction pump', '',
    3, NULL,
    false, ''
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
    25000203, 25000203,
    'inst100', '',
    'Drucksonde', '',
    'sonde de pression', '',
    'sonda di pressione', '',
    'pressure probe', '',
    4, NULL,
    false, ''
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
    25000204, 25000204,
    'inst100', '',
    'Porenwasserdruckgeber (Filterkerze)', '',
    'capteur de pression d''eau interstitielle', '',
    'sensore di pressione dell''acqua dei pori (cartuccia del filtro)', '',
    'pore water pressure sensor (filter cartridge)', '',
    5, NULL,
    false, ''
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
    25000205, 25000205,
    'inst100', '',
    'Manometer', '',
    'manomètre', '',
    'manometro', '',
    'pressure gauge', '',
    6, NULL,
    false, ''
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
    25000206, 25000206,
    'inst100', '',
    'Temperatursonde', '',
    'sonde de température', '',
    'sonda di temperatura', '',
    'temperature probe', '',
    7, NULL,
    false, ''
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
    25000207, 25000207,
    'inst100', '',
    'pH-Sonde', '',
    'sonde de pH', '',
    'sonda pH', '',
    'pH probe', '',
    8, NULL,
    false, ''
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
    25000208, 25000208,
    'inst100', '',
    'Leitfähigkeitssonde', '',
    'sonde de conductivité', '',
    'sonda di conducibilità', '',
    'conductivity probe', '',
    9, NULL,
    false, ''
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
    25000209, 25000209,
    'inst100', '',
    'Sauerstoffsonde', '',
    'sonde à oxygène', '',
    'sonda di ossigeno', '',
    'oxygen probe', '',
    10, NULL,
    false, ''
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
    25000210, 25000210,
    'inst100', '',
    'Redox-Sonde', '',
    'sonde de redox', '',
    'sonda Redox', '',
    'redox probe', '',
    11, NULL,
    false, ''
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
    25000211, 25000211,
    'inst100', '',
    'anderes', '',
    'autre', '',
    'altro', '',
    'other ', '',
    12, NULL,
    false, ''
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
    25000212, 25000212,
    'inst100', '',
    'keine Angaben', '',
    'sans indication', '',
    'senza indicazioni', '',
    'not specified', '',
    13, NULL,
    false, ''
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
    25000213, 25000213,
    'inst101', '',
    'aktiv', '',
    'actif', '',
    'attivo', '',
    'active', '',
    1, NULL,
    false, ''
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
    25000214, 25000214,
    'inst101', '',
    'inaktiv', '',
    'inactif', '',
    'inattivo', '',
    'inactive', '',
    2, NULL,
    false, ''
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
    25000215, 25000215,
    'inst101', '',
    'entfernt', '',
    'supprimé', '',
    'rimosso', '',
    'removed', '',
    3, NULL,
    false, ''
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
    25000216, 25000216,
    'inst101', '',
    'anderes', '',
    'autre', '',
    'altro', '',
    'other ', '',
    4, NULL,
    false, ''
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
    25000217, 25000217,
    'inst101', '',
    'keine Angaben', '',
    'sans indication', '',
    'senza indicazioni', '',
    'not specified', '',
    5, NULL,
    false, ''
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
    25000300, 25000300,
    'fill100', '',
    'Bohrlochverfüllung', '',
    'remplissage du trou de forage', '',
    'riempimento del foro', '',
    'borehole filling', '',
    1, NULL,
    false, ''
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
    25000301, 25000301,
    'fill100', '',
    'Ringraumverfüllung', '',
    'remplissage de l''espace annulaire', '',
    'riempimento dello spazio anulare', '',
    'annular space filling', '',
    2, NULL,
    false, ''
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
    25000302, 25000302,
    'fill100', '',
    'Hinterfüllung', '',
    'remblaiement', '',
    'riempimento', '',
    'backfilling', '',
    3, NULL,
    false, ''
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
    25000303, 25000303,
    'fill100', '',
    'anderes', '',
    'autre', '',
    'altro', '',
    'other ', '',
    4, NULL,
    false, ''
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
    25000304, 25000304,
    'fill100', '',
    'keine Angaben', '',
    'sans indication', '',
    'senza indicazioni', '',
    'not specified', '',
    5, NULL,
    false, ''
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
    25000305, 25000305,
    'fill200', '',
    'Bohrgut', '',
    'débris de forage', '',
    'materiale da taglio dei pozzi', '',
    'borehole cuttings', '',
    1, NULL,
    false, ''
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
    25000306, 25000306,
    'fill200', '',
    'Filterkies', '',
    'gravier filtrant', '',
    'ghiaia filtrante', '',
    'filter gravel', '',
    2, NULL,
    false, ''
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
    25000307, 25000307,
    'fill200', '',
    'Filtersand', '',
    'sable filtrant', '',
    'sabbia filtrante', '',
    'filter sand', '',
    3, NULL,
    false, ''
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
    25000308, 25000308,
    'fill200', '',
    'Zement', '',
    'ciment', '',
    'cemento', '',
    'cement', '',
    4, NULL,
    false, ''
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
    25000309, 25000309,
    'fill200', '',
    'Compacktonit', '',
    'compactonite', '',
    'compactonite', '',
    'compactonite', '',
    5, NULL,
    false, ''
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
    25000310, 25000310,
    'fill200', '',
    'Packer', '',
    'packer', '',
    'packer', '',
    'packer', '',
    6, NULL,
    false, ''
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
    25000311, 25000311,
    'fill200', '',
    'anderes', '',
    'autre', '',
    'altro', '',
    'other ', '',
    7, NULL,
    false, ''
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
    25000312, 25000312,
    'fill200', '',
    'keine Angaben', '',
    'sans indication', '',
    'senza indicazioni', '',
    'not specified', '',
    8, NULL,
    false, ''
);

UPDATE bdms.codelist
	SET code_cli=''
	WHERE schema_cli='custom.lit_str_top_bedrock';

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
    3002, 3002,
    'layer_kind', 'casing',
    'Casing', '',
    'Casing', '',
    'Casing', '',
    'Casing', '',
    3, NULL,
    false, ''
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
    3003, 3003,
    'layer_kind', 'instruments',
    'Instruments', '',
    'Instruments', '',
    'Instruments', '',
    'Instruments', '',
    4, NULL,
    false, ''
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
    3004, 3004,
    'layer_kind', 'filling',
    'Filling', '',
    'Filling', '',
    'Filling', '',
    'Filling', '',
    5, NULL,
    false, ''
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
    3005, 3005,
    'layer_kind', 'hydrogeology',
    'Hydrogeology', '',
    'Hydrogeology', '',
    'Hydrogeology', '',
    'Hydrogeology', '',
    6, NULL,
    false, ''
);

ALTER TABLE bdms.layer
    ADD COLUMN instr_id character varying;

ALTER TABLE bdms.layer
    ADD COLUMN instr_kind_id_cli integer;

ALTER TABLE bdms.layer
    ADD COLUMN instr_status_id_cli integer;

ALTER TABLE bdms.layer
    ADD COLUMN instr_id_sty_fk integer;

ALTER TABLE bdms.layer
    ADD FOREIGN KEY (instr_kind_id_cli)
    REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE bdms.layer
    ADD FOREIGN KEY (instr_status_id_cli)
    REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE bdms.layer
    ADD FOREIGN KEY (instr_id_sty_fk)
    REFERENCES bdms.stratigraphy (id_sty) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE
    NOT VALID;

ALTER TABLE bdms.layer
    ADD COLUMN casng_kind_id_cli integer;

ALTER TABLE bdms.layer
    ADD COLUMN casng_material_id_cli integer;

ALTER TABLE bdms.layer
    ADD COLUMN casng_drilling_id_cli integer;

ALTER TABLE bdms.layer
    ADD FOREIGN KEY (casng_kind_id_cli)
    REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE bdms.layer
    ADD FOREIGN KEY (casng_material_id_cli)
    REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE bdms.layer
    ADD FOREIGN KEY (casng_drilling_id_cli)
    REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE bdms.layer
    ADD COLUMN fill_material_id_cli integer;

ALTER TABLE bdms.layer
    ADD FOREIGN KEY (fill_material_id_cli)
    REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE bdms.stratigraphy
    ADD COLUMN casng_kind_id_cli integer;

ALTER TABLE bdms.stratigraphy
    ADD FOREIGN KEY (casng_kind_id_cli)
    REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE bdms.stratigraphy
    ADD COLUMN casng_id character varying;

ALTER TABLE bdms.stratigraphy
    ADD COLUMN casng_elevation_sty double precision;

ALTER TABLE bdms.stratigraphy
    ADD COLUMN casng_elref_id_cli integer;

ALTER TABLE bdms.stratigraphy
    ADD FOREIGN KEY (casng_elref_id_cli)
    REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE bdms.stratigraphy
    ADD COLUMN casng_date_spud_sty date;

ALTER TABLE bdms.stratigraphy
    ADD COLUMN casng_date_fin_sty date;

ALTER TABLE bdms.stratigraphy
    ADD COLUMN casng_date_abd_sty date;

ALTER TABLE bdms.stratigraphy
    ADD COLUMN notes_sty character varying;

ALTER TABLE bdms.stratigraphy
    ADD COLUMN fill_kind_id_cli integer;

ALTER TABLE bdms.stratigraphy
    ADD FOREIGN KEY (fill_kind_id_cli)
    REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {

    }
}
