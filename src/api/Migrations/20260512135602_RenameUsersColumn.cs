using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RenameUsersColumn : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.RenameColumn(
            name: "settings_usr",
            schema: "bdms",
            table: "users",
            newName: "settings");

        migrationBuilder.RenameColumn(
            name: "disabled_usr",
            schema: "bdms",
            table: "users",
            newName: "disabled");

        migrationBuilder.RenameColumn(
            name: "created_usr",
            schema: "bdms",
            table: "users",
            newName: "created");

        migrationBuilder.RenameColumn(
            name: "admin_usr",
            schema: "bdms",
            table: "users",
            newName: "admin");

        migrationBuilder.RenameColumn(
            name: "id_usr",
            schema: "bdms",
            table: "users",
            newName: "id");
    }
}
