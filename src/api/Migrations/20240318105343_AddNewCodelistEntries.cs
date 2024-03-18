using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddNewCodelistEntries : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
                                INSERT INTO bdms.codelist(
                                id_cli, geolcode, schema_cli, code_cli, text_cli_de, description_cli_de, text_cli_fr, description_cli_fr, text_cli_it,
                                description_cli_it, text_cli_en, description_cli_en, order_cli, conf_cli, default_cli, path_cli
                                ) VALUES
                                (25000313, 25000313, 'backfill_material', '', 'Harz', '', 'résine', '', 'resina', '', 'resin', '', 6, NULL, False, ''),
                                (25000116, 25000116, 'casing_type', '', 'U-Sonde', '', 'sonde en U', '', 'sonda a U', '', 'U-probe', '', 8, NULL, False, ''),
                                (25000117, 25000117, 'casing_type', '', 'Doppel-U-Sonde', '', 'sonde double U', '', 'sonda a doppia U', '', 'double U-probe', '', 9, NULL, False, '');

                                UPDATE bdms.codelist SET order_cli = 7 WHERE id_cli = 25000310;
                                UPDATE bdms.codelist SET order_cli = 8 WHERE id_cli = 25000311;
                                UPDATE bdms.codelist SET order_cli = 9 WHERE id_cli = 25000312;

                                UPDATE bdms.codelist SET order_cli = 7 WHERE id_cli = 30000014;
                                UPDATE bdms.codelist SET order_cli = 10 WHERE id_cli = 25000106;
                                UPDATE bdms.codelist SET order_cli = 11 WHERE id_cli = 25000107;
                          
                ");
    }
}
