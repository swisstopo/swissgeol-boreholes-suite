using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class FixTypoInCodelist : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"UPDATE bdms.codelist SET text_cli_fr ='ferme (moyenne)' WHERE id_cli = 21103003;");
    }
}
