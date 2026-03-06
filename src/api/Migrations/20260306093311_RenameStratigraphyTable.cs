using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RenameStratigraphyTable : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.RenameTable(
            name: "stratigraphy_v2",
            schema: "bdms",
            newName: "stratigraphy",
            newSchema: "bdms");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.RenameTable(
            name: "stratigraphy",
            schema: "bdms",
            newName: "stratigraphy_v2",
            newSchema: "bdms");
    }
}
