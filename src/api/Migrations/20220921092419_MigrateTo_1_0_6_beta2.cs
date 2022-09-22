using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

#pragma warning disable CA1707 // Identifiers should not contain underscores
public partial class MigrateTo_1_0_6_beta2 : Migration
#pragma warning restore CA1707 // Identifiers should not contain underscores
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"UPDATE
    bdms.config
SET
    value_cfg = '1.0.6'
WHERE
    name_cfg = 'VERSION';

UPDATE
    bdms.config
SET
    value_cfg = '1.0.6-beta.1'
WHERE
    name_cfg = 'PREVIOUS';

UPDATE
    bdms.config
SET
    value_cfg = to_char(now(), 'YYYY-MM-DD""T""HH24:MI:SSOF')
WHERE
    name_cfg = 'PG_UPGRADE';

ALTER TABLE
    bdms.stratigraphy DROP COLUMN fill_kind_id_cli;

ALTER TABLE
    bdms.layer
ADD
    COLUMN fill_kind_id_cli integer;

ALTER TABLE
    bdms.layer
ADD
    FOREIGN KEY (fill_kind_id_cli) REFERENCES bdms.codelist (id_cli) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

ALTER TABLE
    bdms.stratigraphy
ADD
    COLUMN fill_casng_id_sty_fk integer;

ALTER TABLE
    bdms.layer DROP CONSTRAINT layer_instr_id_sty_fk_fkey;

-- ALTER TABLE
--     bdms.stratigraphy DROP CONSTRAINT stratigraphy_fill_casng_id_sty_fk_fkey;

ALTER TABLE bdms.borehole
    ADD COLUMN total_depth_tvd_bho double precision;

ALTER TABLE bdms.borehole
    ADD COLUMN qt_total_depth_tvd_id_cli integer;

ALTER TABLE
    bdms.borehole
ADD
    FOREIGN KEY (qt_total_depth_tvd_id_cli)
    REFERENCES bdms.codelist (id_cli)
    MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

ALTER TABLE bdms.layer
    ADD COLUMN uscs_3_id_cli integer;

ALTER TABLE
    bdms.layer
ADD
    FOREIGN KEY (uscs_3_id_cli)
    REFERENCES bdms.codelist (id_cli)
    MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

ALTER TABLE bdms.layer
    ADD COLUMN lithology_top_bedrock_id_cli integer;

ALTER TABLE
    bdms.layer
ADD
    FOREIGN KEY (lithology_top_bedrock_id_cli)
    REFERENCES bdms.codelist (id_cli)
    MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
