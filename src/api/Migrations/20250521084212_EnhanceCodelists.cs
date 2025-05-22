using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class EnhanceCodelists : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            UPDATE bdms.codelist SET text_cli_fr ='Godet de forage' WHERE id_cli = 22107012;

            INSERT INTO bdms.codelist(
                                id_cli, geolcode, schema_cli, code_cli, text_cli_de, text_cli_fr, text_cli_it,
                                text_cli_en, order_cli, conf_cli, default_cli, path_cli
                                ) VALUES
                                (25000121, 25000121, 'casing_type', '', 'Liner', 'liner', 'liner', 'liner', 9, NULL, False, '');

            UPDATE bdms.codelist SET order_cli = 8 WHERE id_cli = 30000014;
            UPDATE bdms.codelist SET order_cli = 10 WHERE id_cli = 25000116;
            UPDATE bdms.codelist SET order_cli = 11 WHERE id_cli = 25000119;
            UPDATE bdms.codelist SET order_cli = 12 WHERE id_cli = 25000117;
            UPDATE bdms.codelist SET order_cli = 13 WHERE id_cli = 25000120;
            UPDATE bdms.codelist SET order_cli = 14 WHERE id_cli = 25000106;
            UPDATE bdms.codelist SET order_cli = 15 WHERE id_cli = 25000107;");
    }
}
#pragma warning restore CA1505
