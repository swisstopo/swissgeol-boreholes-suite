using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class AddAlterationDegreeCode : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            SELECT setval('bdms.codelist_id_cli_seq', (SELECT MAX(id_cli) FROM bdms.codelist));
            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('alteration_degree', '', 'weathered', 'verwittert', 'altéré', 'alterato', 11);
        ");
    }
}
#pragma warning restore CA1505
