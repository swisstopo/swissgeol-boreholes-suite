using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class CleanLithologyCodelists : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            UPDATE bdms.codelist
            SET order_cli=90
            WHERE id_cli=23101010;

            UPDATE bdms.lithology_description
            SET gradation_id=100000495
            WHERE gradation_id=30000020;

            DELETE FROM bdms.codelist
            WHERE id_cli=30000020;
        ");
    }
}
#pragma warning restore CA1505
