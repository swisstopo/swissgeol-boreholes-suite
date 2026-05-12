using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RenameWorkgroupColumns : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.RenameColumn(
            name: "settings_wgp",
            schema: "bdms",
            table: "workgroups",
            newName: "settings");

        migrationBuilder.RenameColumn(
            name: "name_wgp",
            schema: "bdms",
            table: "workgroups",
            newName: "name");

        migrationBuilder.RenameColumn(
            name: "disabled_wgp",
            schema: "bdms",
            table: "workgroups",
            newName: "disabled");

        migrationBuilder.RenameColumn(
            name: "created_wgp",
            schema: "bdms",
            table: "workgroups",
            newName: "creation");

        migrationBuilder.RenameColumn(
            name: "id_wgp",
            schema: "bdms",
            table: "workgroups",
            newName: "id");
    }
}
