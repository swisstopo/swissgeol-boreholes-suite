using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class UpdateLOGUnknown : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            UPDATE bdms.codelist
            SET text_cli_de = 'Anderer'
            WHERE id_cli = 100003002 OR id_cli = 100003007;

            UPDATE bdms.codelist
            SET
                text_cli_en = 'Not specified',
                text_cli_de = 'Keine Angabe',
                text_cli_fr = 'Sans indication',
                text_cli_it = 'Senza indicazioni'
            WHERE id_cli = 100003003 OR id_cli = 100003008;
        ");
    }
}
#pragma warning restore CA1505
