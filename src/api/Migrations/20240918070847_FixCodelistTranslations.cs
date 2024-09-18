using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class FixCodelistTranslations : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"UPDATE bdms.codelist SET text_cli_de = 'Tonpellets' WHERE id_cli = 25000309;");
    }
}

#pragma warning restore CA1505
