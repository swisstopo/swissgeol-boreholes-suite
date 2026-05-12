using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RenameUserWorkgroupRoleColumns : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "user_roles_id_usr_fk_fkey",
            schema: "bdms",
            table: "users_roles");

        migrationBuilder.DropForeignKey(
            name: "users_roles_id_wgp_fk_fkey",
            schema: "bdms",
            table: "users_roles");

        migrationBuilder.DropForeignKey(
            name: "users_roles_id_rol_fk_fkey",
            schema: "bdms",
            table: "users_roles");

        migrationBuilder.RenameColumn(
            name: "id_usr_fk",
            schema: "bdms",
            table: "users_roles",
            newName: "user_id");

        migrationBuilder.RenameColumn(
            name: "id_rol_fk",
            schema: "bdms",
            table: "users_roles",
            newName: "role_id");

        migrationBuilder.RenameColumn(
            name: "id_wgp_fk",
            schema: "bdms",
            table: "users_roles",
            newName: "workgroup_id");

        migrationBuilder.RenameColumn(
            name: "id_rol",
            schema: "bdms",
            table: "roles",
            newName: "id");

        migrationBuilder.RenameColumn(
            name: "name_rol",
            schema: "bdms",
            table: "roles",
            newName: "name");

        migrationBuilder.RenameColumn(
            name: "config_rol",
            schema: "bdms",
            table: "roles",
            newName: "config");

        migrationBuilder.CreateIndex(
            name: "IX_users_roles_user_id",
            schema: "bdms",
            table: "users_roles",
            column: "user_id");

        migrationBuilder.RenameIndex(
            name: "IX_users_roles_id_rol_fk_fkey",
            schema: "bdms",
            table: "users_roles",
            newName: "IX_users_roles_role_id");

        migrationBuilder.RenameIndex(
            name: "IX_users_roles_id_wgp_fk_fkey",
            schema: "bdms",
            table: "users_roles",
            newName: "IX_users_roles_workgroup_id");

        migrationBuilder.AddForeignKey(
            name: "FK_users_roles_users_user_id",
            schema: "bdms",
            table: "users_roles",
            column: "user_id",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id_usr",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_users_roles_roles_role_id",
            schema: "bdms",
            table: "users_roles",
            column: "role_id",
            principalSchema: "bdms",
            principalTable: "roles",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_users_roles_workgroups_workgroup_id",
            schema: "bdms",
            table: "users_roles",
            column: "workgroup_id",
            principalSchema: "bdms",
            principalTable: "workgroups",
            principalColumn: "id_wgp",
            onDelete: ReferentialAction.Cascade);
    }
}
