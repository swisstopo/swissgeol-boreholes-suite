using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

#pragma warning disable CA1505

/// <inheritdoc />
public partial class AddBoreholeTypeCodelist : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
                                INSERT INTO bdms.codelist(
                                id_cli, geolcode, schema_cli, code_cli, text_cli_de, description_cli_de, text_cli_fr, description_cli_fr, text_cli_it,
                                description_cli_it, text_cli_en, description_cli_en, order_cli, conf_cli, default_cli, path_cli
                                ) VALUES
                                (20101006, 20101006, 'borehole_type', '', 'Aufschluss', '', 'affleurement', '', 'affioramento', '', 'outcrop', '', 5, NULL, False, '');

                                UPDATE bdms.codelist SET order_cli = 6 WHERE id_cli = 20101004;
                                UPDATE bdms.codelist SET order_cli = 7 WHERE id_cli = 20101005;");
    }
}
#pragma warning restore CA1505
