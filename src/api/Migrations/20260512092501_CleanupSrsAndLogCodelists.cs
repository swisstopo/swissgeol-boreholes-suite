using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class CleanupSrsAndLogCodelists : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Remove unused legacy GeoDIN SRS codelists
        migrationBuilder.Sql(@"
            DELETE FROM bdms.codelist
            WHERE id_cli=20104003;

            DELETE FROM bdms.codelist
            WHERE id_cli=20104004;

            DELETE FROM bdms.codelist
            WHERE id_cli=20104005;
        ");

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
