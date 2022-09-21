using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

#pragma warning disable CA1707 // Identifiers should not contain underscores
public partial class MigrateTo_1_0_6_beta1 : Migration
#pragma warning restore CA1707 // Identifiers should not contain underscores
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"UPDATE
  bdms.config
SET
  value_cfg = '1.0.6-beta.1'
WHERE
  name_cfg = 'VERSION';

UPDATE
  bdms.config
SET
  value_cfg = '1.0.5'
WHERE
  name_cfg = 'PREVIOUS';

UPDATE
  bdms.config
SET
  value_cfg = to_char(now(), 'YYYY-MM-DD""T""HH24:MI:SSOF')
WHERE
  name_cfg = 'PG_UPGRADE';

ALTER TABLE bdms.borehole
    RENAME author_id TO created_by_bho;

ALTER TABLE bdms.borehole
    RENAME updater_bho TO updated_by_bho;

ALTER TABLE bdms.borehole
    RENAME update_bho TO updated_bho;

ALTER TABLE bdms.borehole DROP COLUMN published_bho;

ALTER TABLE bdms.borehole
    RENAME locked_by TO locked_by_bho;

ALTER TABLE bdms.borehole
    RENAME locked_at TO locked_bho;

ALTER TABLE bdms.borehole
    RENAME length_bho TO total_depth_bho;

ALTER TABLE bdms.borehole
    RENAME public_name_bho TO alternate_name_bho;

ALTER TABLE bdms.borehole DROP COLUMN landuse_id_cli;

ALTER TABLE bdms.borehole
    RENAME method_id_cli TO drilling_method_id_cli;

ALTER TABLE bdms.borehole DROP COLUMN address_bho;

ALTER TABLE bdms.borehole
    RENAME drill_diameter_bho TO drilling_diameter_bho;

ALTER TABLE bdms.borehole
    RENAME bore_inc_bho TO inclination_bho;

ALTER TABLE bdms.borehole
    RENAME bore_inc_dir_bho TO inclination_direction_bho;

ALTER TABLE bdms.borehole
    RENAME qt_bore_inc_dir_id_cli TO qt_inclination_direction_id_cli;

ALTER TABLE bdms.borehole
    RENAME qt_length_id_cli TO qt_depth_id_cli;

UPDATE bdms.codelist
	SET code_cli = 'qt_depth'
	WHERE id_cli = 1029;
	
UPDATE bdms.codelist
	SET schema_cli = 'custom.qt_depth'
	WHERE schema_cli = 'custom.qt_length';
	
UPDATE bdms.codelist
	SET schema_cli = 'extended.drilling_method'
	WHERE schema_cli = 'extended.method';

UPDATE bdms.codelist SET
conf_cli=((
	'{""title"": ""lithostratigraphy_id_cli"", ""titleNS"": ""custom.lithostratigraphy_top_bedrock"", ""subtitle"": ""chronostratigraphy_id_cli"",""titleNS"": ""custom.chro_str_top_bedrock"",""text"": ""lithology_id_cli"", ""textNS"": ""custom.lithology_top_bedrock"", ""colorNS"": ""custom.lithostratigraphy_top_bedrock"", ""pattern"": ""lithology"", ""patternNS"": ""custom.lithology_top_bedrock""}'
)::jsonb || conf_cli::jsonb)::json
WHERE id_cli = 3000;
	
UPDATE bdms.codelist
SET conf_cli = 
jsonb_set(conf_cli::jsonb, '{textNS}', '""custom.lithology_top_bedrock""', false)
WHERE id_cli = 3000;

UPDATE bdms.codelist
SET conf_cli = 
jsonb_set(conf_cli::jsonb, '{colorNS}', '""custom.lithostratigraphy_top_bedrock""', false)
WHERE id_cli = 3000;

UPDATE bdms.codelist
SET conf_cli = 
jsonb_set(conf_cli::jsonb, '{patternNS}', '""custom.lithology_top_bedrock""', false)
WHERE id_cli = 3000;

ALTER TABLE bdms.borehole
    RENAME lithology_id_cli TO lithology_top_bedrock_id_cli;

UPDATE bdms.codelist
	SET code_cli = 'custom.lithology_top_bedrock'
	WHERE id_cli = 1033;

UPDATE bdms.codelist
	SET schema_cli = 'custom.lithology_top_bedrock'
	WHERE schema_cli = 'custom.lit_pet_top_bedrock';

UPDATE bdms.codelist
    SET schema_cli='custom.lithostratigraphy_top_bedrock'
    WHERE schema_cli = 'custom.lit_str_top_bedrock';

UPDATE bdms.codelist
	SET code_cli = 'lithostratigraphy_top_bedrock'
	WHERE id_cli = 1034;

UPDATE bdms.codelist
	SET schema_cli = 'custom.chronostratigraphy_top_bedrock'
	WHERE schema_cli = 'custom.chro_str_top_bedrock';

UPDATE bdms.codelist
	SET code_cli = 'chronostratigraphy_top_bedrock'
	WHERE id_cli = 1035;

ALTER TABLE bdms.borehole DROP COLUMN mistakes_bho;
ALTER TABLE bdms.borehole DROP COLUMN processing_status_id_cli;
ALTER TABLE bdms.borehole DROP COLUMN national_relevance_id_cli;

ALTER TABLE bdms.layer
    ADD COLUMN casng_inner_diameter_lay double precision;

ALTER TABLE bdms.layer
    ADD COLUMN casng_outer_diameter_lay double precision;

ALTER TABLE bdms.layer DROP COLUMN casng_drilling_id_cli;

ALTER TABLE bdms.layer
    RENAME description_lay TO lithological_description_lay;

ALTER TABLE bdms.layer
    RENAME geology_lay TO facies_description_lay;

ALTER TABLE bdms.borehole
    ADD COLUMN spud_date_bho date;

ALTER TABLE bdms.borehole
    ADD COLUMN top_bedrock_tvd_bho double precision;

ALTER TABLE bdms.borehole
    ADD COLUMN qt_top_bedrock_tvd_id_cli integer;

ALTER TABLE bdms.borehole
    ADD FOREIGN KEY (qt_top_bedrock_tvd_id_cli)
    REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE bdms.layer
    ADD COLUMN casng_date_spud_lay date;

ALTER TABLE bdms.layer
    ADD COLUMN casng_date_finish_lay date;

ALTER TABLE bdms.stratigraphy DROP COLUMN casng_kind_id_cli;

ALTER TABLE bdms.stratigraphy DROP COLUMN casng_elevation_sty;

ALTER TABLE bdms.stratigraphy DROP COLUMN casng_elref_id_cli;

ALTER TABLE bdms.stratigraphy DROP COLUMN casng_date_spud_sty;

ALTER TABLE bdms.stratigraphy DROP COLUMN casng_date_fin_sty;

ALTER TABLE bdms.layer
    ADD COLUMN gradation_id_cli integer;

-- 1.0.6

ALTER TABLE bdms.layer
    ADD COLUMN casng_id character varying;

ALTER TABLE bdms.borehole
    ADD COLUMN reference_elevation_bho double precision;

ALTER TABLE bdms.borehole
    ADD COLUMN qt_reference_elevation_id_cli integer;

ALTER TABLE bdms.borehole
    ADD FOREIGN KEY (qt_reference_elevation_id_cli)
    REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE bdms.borehole
    ADD COLUMN reference_elevation_type_id_cli integer;

ALTER TABLE bdms.borehole
    ADD FOREIGN KEY (reference_elevation_type_id_cli)
    REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

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
    30000015, 30000015,
    'gradation', '',
    'sehr gut sortiert', '',
    'très bien trié', '',
    'molto ben classato', '',
    'very well-sorted', '',
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
    30000016, 30000016,
    'gradation', '',
    'gut sortiert', '',
    'bien trié', '',
    'ben classato', '',
    'well sorted', '',
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
    30000017, 30000017,
    'gradation', '',
    'mässig sortiert', '',
    'moyennement trié', '',
    'moderatamente classato', '',
    'moderately sorted', '',
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
    30000018, 30000018,
    'gradation', '',
    'schlecht sortiert', '',
    'mal trié', '',
    'mal classato', '',
    'poorly sorted', '',
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
    30000019, 30000019,
    'gradation', '',
    'sehr schlecht sortiert', '',
    'très mal trié', '',
    'molto mal classato', '',
    'very poorly sorted', '',
    5, NULL,
    false, ''
);");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
