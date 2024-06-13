using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddCasingTypeCodelist : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
                                INSERT INTO bdms.codelist(
                                id_cli, geolcode, schema_cli, code_cli, text_cli_de, text_cli_fr, text_cli_it,
                                text_cli_en, order_cli, conf_cli, default_cli, path_cli
                                ) VALUES
                                (25000118, 25000118, 'casing_type', '', 'temporäre Schutzverrohrung', 'tubage de protection temporaire',
                                'tubo di rivestimento per protezione temporanea', 'temporary protective casing', 1, NULL, False, '');

                                UPDATE bdms.codelist SET order_cli = 2 WHERE id_cli = 25000100;
                                UPDATE bdms.codelist SET order_cli = 3 WHERE id_cli = 25000101;
                                UPDATE bdms.codelist SET order_cli = 4 WHERE id_cli = 25000102;
                                UPDATE bdms.codelist SET order_cli = 5 WHERE id_cli = 25000103;
                                UPDATE bdms.codelist SET order_cli = 6 WHERE id_cli = 25000104;
                                UPDATE bdms.codelist SET order_cli = 7 WHERE id_cli = 25000105;
                                UPDATE bdms.codelist SET order_cli = 8 WHERE id_cli = 25000114;
                                UPDATE bdms.codelist SET order_cli = 9 WHERE id_cli = 25000116;
                                UPDATE bdms.codelist SET order_cli = 10 WHERE id_cli = 25000117;
                                UPDATE bdms.codelist SET order_cli = 11 WHERE id_cli = 25000106;
                                UPDATE bdms.codelist SET order_cli = 12 WHERE id_cli = 25000107;");
    }

}
