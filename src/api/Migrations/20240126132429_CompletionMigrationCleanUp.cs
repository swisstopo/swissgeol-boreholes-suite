using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class CompletionMigrationCleanUp : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "layer_casng_kind_id_cli_fkey",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropForeignKey(
            name: "layer_casng_material_id_cli_fkey",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropForeignKey(
            name: "layer_fill_kind_id_cli_fkey",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropForeignKey(
            name: "layer_fill_material_id_cli_fkey",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropForeignKey(
            name: "layer_instr_kind_id_cli_fkey",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropForeignKey(
            name: "layer_instr_status_id_cli_fkey",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropForeignKey(
            name: "layer_instr_id_lay",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropIndex(
            name: "IX_stratigraphy_fill_casng_id_sty_fk",
            schema: "bdms",
            table: "stratigraphy");

        migrationBuilder.DropIndex(
            name: "IX_layer_casng_kind_id_cli_fkey",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropIndex(
            name: "IX_layer_casng_material_id_cli_fkey",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropIndex(
            name: "IX_layer_fill_kind_id_cli_fkey",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropIndex(
            name: "IX_layer_fill_material_id_cli_fkey",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropIndex(
            name: "IX_layer_instr_id_lay",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropIndex(
            name: "IX_layer_instr_kind_id_cli_fkey",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropIndex(
            name: "IX_layer_instr_status_id_cli_fkey",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "casng_date_abd_sty",
            schema: "bdms",
            table: "stratigraphy");

        migrationBuilder.DropColumn(
            name: "casng_id",
            schema: "bdms",
            table: "stratigraphy");

        migrationBuilder.DropColumn(
            name: "fill_casng_id_sty_fk",
            schema: "bdms",
            table: "stratigraphy");

        migrationBuilder.DropColumn(
            name: "casng_date_finish_lay",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "casng_date_spud_lay",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "casng_id",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "casng_inner_diameter_lay",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "casng_kind_id_cli",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "casng_material_id_cli",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "casng_outer_diameter_lay",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "fill_kind_id_cli",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "fill_material_id_cli",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "instr_id",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "instr_id_lay_fk",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "instr_id_sty_fk",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "instr_kind_id_cli",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "instr_status_id_cli",
            schema: "bdms",
            table: "layer");

        migrationBuilder.Sql(@"DELETE FROM bdms.codelist WHERE id_cli in (3002,3003,3004);");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
