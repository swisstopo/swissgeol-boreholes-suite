using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddMissingMigration : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_casing_element_codelist_kind_id",
            schema: "bdms",
            table: "casing_element");

        migrationBuilder.AlterColumn<int>(
            name: "precision_location_y_lv03",
            schema: "bdms",
            table: "borehole",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AlterColumn<int>(
            name: "precision_location_y",
            schema: "bdms",
            table: "borehole",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AlterColumn<int>(
            name: "precision_location_x_lv03",
            schema: "bdms",
            table: "borehole",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AlterColumn<int>(
            name: "precision_location_x",
            schema: "bdms",
            table: "borehole",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AddForeignKey(
            name: "FK_casing_element_codelist_kind_id",
            schema: "bdms",
            table: "casing_element",
            column: "kind_id",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_casing_element_codelist_kind_id",
            schema: "bdms",
            table: "casing_element");

        migrationBuilder.AlterColumn<int>(
            name: "precision_location_y_lv03",
            schema: "bdms",
            table: "borehole",
            type: "integer",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);

        migrationBuilder.AlterColumn<int>(
            name: "precision_location_y",
            schema: "bdms",
            table: "borehole",
            type: "integer",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);

        migrationBuilder.AlterColumn<int>(
            name: "precision_location_x_lv03",
            schema: "bdms",
            table: "borehole",
            type: "integer",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);

        migrationBuilder.AlterColumn<int>(
            name: "precision_location_x",
            schema: "bdms",
            table: "borehole",
            type: "integer",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);

        migrationBuilder.AddForeignKey(
            name: "FK_casing_element_codelist_kind_id",
            schema: "bdms",
            table: "casing_element",
            column: "kind_id",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli");
    }
}
