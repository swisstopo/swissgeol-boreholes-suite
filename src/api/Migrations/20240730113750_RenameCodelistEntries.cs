using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RenameCodelistEntries : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
UPDATE bdms.codelist
SET text_cli_en = 'screened casing'
WHERE id_cli = 25000101;

UPDATE bdms.codelist
SET text_cli_de = 'Kunststoff (nicht Spezifiziert)'
WHERE id_cli = 25000110;
");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
