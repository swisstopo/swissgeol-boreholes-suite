using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class CleanupLogCodelists : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {


        // Add missing codes for LOG tool type.
        migrationBuilder.Sql(@"
            UPDATE bdms.codelist
            SET code_cli='OTHER'
            WHERE id_cli=100003055;

            UPDATE bdms.codelist
            SET code_cli='UNSPEC'
            WHERE id_cli=100003056;
        ");
    }
}
