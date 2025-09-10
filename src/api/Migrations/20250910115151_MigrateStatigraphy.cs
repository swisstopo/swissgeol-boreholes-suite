using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class MigrateStatigraphy : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_lithology_stratigraphy_v2_stratigraphy_id",
            schema: "bdms",
            table: "lithology");

        migrationBuilder.DropForeignKey(
            name: "stratigraphy_id_bho_fk_fkey",
            schema: "bdms",
            table: "stratigraphy");

        migrationBuilder.DropForeignKey(
            name: "FK_stratigraphy_codelist_quality_id_sty",
            schema: "bdms",
            table: "stratigraphy");

        migrationBuilder.DropForeignKey(
            name: "stratigraphy_author_sty_fkey",
            schema: "bdms",
            table: "stratigraphy");

        migrationBuilder.DropForeignKey(
            name: "stratigraphy_updater_sty_fkey",
            schema: "bdms",
            table: "stratigraphy");

        migrationBuilder.DropTable(
            name: "stratigraphy_v2",
            schema: "bdms");

        migrationBuilder.DropIndex(
            name: "IX_stratigraphy_quality_id_sty",
            schema: "bdms",
            table: "stratigraphy");

        migrationBuilder.DropColumn(
            name: "notes_sty",
            schema: "bdms",
            table: "stratigraphy");

        migrationBuilder.DropColumn(
            name: "quality_id",
            schema: "bdms",
            table: "stratigraphy");

        migrationBuilder.RenameColumn(
            name: "updater_sty",
            schema: "bdms",
            table: "stratigraphy",
            newName: "updater");

        migrationBuilder.RenameColumn(
            name: "update_sty",
            schema: "bdms",
            table: "stratigraphy",
            newName: "update");

        migrationBuilder.RenameColumn(
            name: "primary_sty",
            schema: "bdms",
            table: "stratigraphy",
            newName: "is_primary");

        migrationBuilder.RenameColumn(
            name: "name_sty",
            schema: "bdms",
            table: "stratigraphy",
            newName: "name");

        migrationBuilder.RenameColumn(
            name: "id_bho_fk",
            schema: "bdms",
            table: "stratigraphy",
            newName: "borehole_id");

        migrationBuilder.RenameColumn(
            name: "date_sty",
            schema: "bdms",
            table: "stratigraphy",
            newName: "date");

        migrationBuilder.RenameColumn(
            name: "creation_sty",
            schema: "bdms",
            table: "stratigraphy",
            newName: "creation");

        migrationBuilder.RenameColumn(
            name: "author_sty",
            schema: "bdms",
            table: "stratigraphy",
            newName: "creator");

        migrationBuilder.RenameColumn(
            name: "id_sty",
            schema: "bdms",
            table: "stratigraphy",
            newName: "id");

        migrationBuilder.RenameIndex(
            name: "IX_stratigraphy_updater_sty_fkey",
            schema: "bdms",
            table: "stratigraphy",
            newName: "IX_stratigraphy_updater");

        migrationBuilder.RenameIndex(
            name: "IX_stratigraphy_id_bho_fk_fkey",
            schema: "bdms",
            table: "stratigraphy",
            newName: "IX_stratigraphy_borehole_id");

        migrationBuilder.RenameIndex(
            name: "IX_stratigraphy_author_sty_fkey",
            schema: "bdms",
            table: "stratigraphy",
            newName: "IX_stratigraphy_creator");

        migrationBuilder.AlterColumn<bool>(
            name: "is_primary",
            schema: "bdms",
            table: "stratigraphy",
            type: "boolean",
            nullable: false,
            defaultValue: false,
            oldClrType: typeof(bool),
            oldType: "boolean",
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "name",
            schema: "bdms",
            table: "stratigraphy",
            type: "text",
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "text",
            oldNullable: true);

        migrationBuilder.AlterColumn<int>(
            name: "borehole_id",
            schema: "bdms",
            table: "stratigraphy",
            type: "integer",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);

        migrationBuilder.AddForeignKey(
            name: "FK_lithology_stratigraphy_stratigraphy_id",
            schema: "bdms",
            table: "lithology",
            column: "stratigraphy_id",
            principalSchema: "bdms",
            principalTable: "stratigraphy",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_stratigraphy_borehole_borehole_id",
            schema: "bdms",
            table: "stratigraphy",
            column: "borehole_id",
            principalSchema: "bdms",
            principalTable: "borehole",
            principalColumn: "id_bho",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_stratigraphy_users_creator",
            schema: "bdms",
            table: "stratigraphy",
            column: "creator",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id_usr");

        migrationBuilder.AddForeignKey(
            name: "FK_stratigraphy_users_updater",
            schema: "bdms",
            table: "stratigraphy",
            column: "updater",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id_usr");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
#pragma warning restore CA1505
