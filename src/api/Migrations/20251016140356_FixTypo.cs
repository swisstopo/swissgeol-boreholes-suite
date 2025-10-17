using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class FixTypo : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            UPDATE bdms.codelist
            SET schema_cli= 'log_conveyance_method'
            WHERE schema_cli = 'log_convenyance_method';
        ");
    }
}
#pragma warning restore CA1505
