using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class FixPlasticTranslation : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"UPDATE bdms.codelist SET text_cli_de = 'Kunststoff (nicht spezifiziert)' WHERE id_cli = 25000110;");
    }
}
