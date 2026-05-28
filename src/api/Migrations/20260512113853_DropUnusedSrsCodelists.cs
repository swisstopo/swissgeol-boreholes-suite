using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class DropUnusedSrsCodelists : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            DELETE FROM bdms.codelist
            WHERE id_cli=20104003;

            DELETE FROM bdms.codelist
            WHERE id_cli=20104004;

            DELETE FROM bdms.codelist
            WHERE id_cli=20104005;
        ");
    }
}
