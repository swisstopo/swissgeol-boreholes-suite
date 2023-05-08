using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class FixAndExtendChronoCodes : Migration
{
    /// <summary>
    /// Fix and extend Chronostratigraphy Geolcodes. The order column is multiplied by 10
    /// to insert new values in between.
    /// </summary>
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
UPDATE bdms.codelist
SET conf_cli = '{""color"":[103,143,102]}'
WHERE geolcode = 15001124;

UPDATE bdms.codelist
SET path_cli = '15001001.15001002.15001013.15001014.30000312.15001015'
WHERE geolcode = 15001015;

UPDATE bdms.codelist
SET path_cli = '15001001.15001002.15001013.15001014.30000313.15001016'
WHERE geolcode = 15001016;

UPDATE bdms.codelist
SET order_cli = order_cli * 10
WHERE schema_cli = 'custom.chronostratigraphy_top_bedrock'

INSERT INTO bdms.codelist (id_cli, geolcode, code_cli, schema_cli, text_cli_de, description_cli_de, text_cli_fr, description_cli_fr, text_cli_it, description_cli_it, text_cli_en, description_cli_en, conf_cli, order_cli, path_cli)
VALUES
    (30000312, 30000312, '', 'custom.chronostratigraphy_top_bedrock', 'Spätes Pliozän', '', 'Pliocène tardif', '', 'Tardo Pliocene', '', 'Late Pliocene', '', '{""color"":[255,255,153]}', 145, '15001001.15001002.15001013.15001014.30000312'),
    (30000313, 30000313, '', 'custom.chronostratigraphy_top_bedrock', 'Frühes Pliozän', '', 'Pliocène précoce', '', 'Primo Pliocene', '', 'Early Pliocene', '', '{""color"":[255,255,153]}', 155, '15001001.15001002.15001013.15001014.30000313');
");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
