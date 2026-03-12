using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class CleanupLegacyStratigraphyCodelists : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            DELETE FROM bdms.codelist WHERE schema_cli = 'colour';
            DELETE FROM bdms.codelist WHERE schema_cli = 'alteration';
            DELETE FROM bdms.codelist WHERE schema_cli = 'description_quality';
            DELETE FROM bdms.codelist WHERE schema_cli = 'custom.top_bedrock';
        ");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
