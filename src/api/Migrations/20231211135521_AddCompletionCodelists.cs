using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations
{
    /// <inheritdoc />
    public partial class AddCompletionCodelists : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"INSERT INTO bdms.codelist(
                                id_cli, geolcode, schema_cli, code_cli, text_cli_de, description_cli_de, text_cli_fr, description_cli_fr, text_cli_it,
                                description_cli_it, text_cli_en, description_cli_en, order_cli, conf_cli, default_cli, path_cli
                                ) VALUES
                                (16000000, 16000000, 'completion_kind', '', 'ohne Verrohrung', '', 'pas de tubage', '', 'senza tubazione', '', 'no casing', '', 1, NULL, False, ''),
                                (16000001, 16000001, 'completion_kind', '', 'teleskopiert', '', 'télescopique', '', 'telescopico', '', 'telescopic', '', 1, NULL, False, ''),
                                (16000002, 16000002, 'completion_kind', '', 'parallel', '', 'parallel', '', 'parallelo', '', 'in parallel', '', 1, NULL, False, '');");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
