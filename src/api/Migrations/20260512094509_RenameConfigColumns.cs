using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RenameConfigColumns : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.RenameColumn(
            name: "value_cfg",
            schema: "bdms",
            table: "config",
            newName: "value");

        migrationBuilder.RenameColumn(
            name: "name_cfg",
            schema: "bdms",
            table: "config",
            newName: "name");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.RenameColumn(
            name: "value",
            schema: "bdms",
            table: "config",
            newName: "value_cfg");

        migrationBuilder.RenameColumn(
            name: "name",
            schema: "bdms",
            table: "config",
            newName: "name_cfg");
    }
}
