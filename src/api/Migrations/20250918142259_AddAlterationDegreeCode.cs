using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddAlterationDegreeCode : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('alteration_degree', '', 'weathered', 'verwittert', 'altére', 'alterato', 11);
        ");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
