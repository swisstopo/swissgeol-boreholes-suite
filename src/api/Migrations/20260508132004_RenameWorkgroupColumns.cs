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

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.RenameColumn(
            name: "settings",
            schema: "bdms",
            table: "workgroups",
            newName: "settings_wgp");

        migrationBuilder.RenameColumn(
            name: "name",
            schema: "bdms",
            table: "workgroups",
            newName: "name_wgp");

        migrationBuilder.RenameColumn(
            name: "disabled",
            schema: "bdms",
            table: "workgroups",
            newName: "disabled_wgp");

        migrationBuilder.RenameColumn(
            name: "creation",
            schema: "bdms",
            table: "workgroups",
            newName: "created_wgp");

        migrationBuilder.RenameColumn(
            name: "id",
            schema: "bdms",
            table: "workgroups",
            newName: "id_wgp");
    }
}
