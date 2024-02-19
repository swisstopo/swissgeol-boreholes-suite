using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RemoveLayerKind : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "stratigraphy_kind_id_cli_fkey",
            schema: "bdms",
            table: "stratigraphy");

        migrationBuilder.DropIndex(
            name: "IX_stratigraphy_kind_id_cli_fkey",
            schema: "bdms",
            table: "stratigraphy");

        migrationBuilder.DropColumn(
            name: "kind_id_cli",
            schema: "bdms",
            table: "stratigraphy");

        migrationBuilder.Sql(@"DELETE FROM bdms.codelist WHERE id_cli in (3005);");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
