using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class AddMissingConstraints : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddForeignKey(
            name: "layer_codelist_id_lay_fk_fkey",
            schema: "bdms",
            table: "layer_codelist",
            column: "id_lay_fk",
            principalSchema: "bdms",
            principalTable: "layer",
            principalColumn: "id_lay");

        migrationBuilder.CreateIndex(
            name: "IX_layer_codelist_id_lay_fk",
            schema: "bdms",
            table: "layer_codelist",
            column: "id_lay_fk");

        migrationBuilder.AddForeignKey(
            name: "layer_codelist_id_cli_fk_fkey",
            schema: "bdms",
            table: "layer_codelist",
            column: "id_cli_fk",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_codelist",
            column: "id_cli_fk");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "layer_codelist_id_lay_fk_fkey",
            schema: "bdms",
            table: "layer_codelist");

        migrationBuilder.DropForeignKey(
            name: "layer_codelist_id_cli_fk_fkey",
            schema: "bdms",
            table: "layer_codelist");

        migrationBuilder.DropIndex(
            name: "IX_layer_codelist_id_lay_fk",
            schema: "bdms",
            table: "layer_codelist");

        migrationBuilder.DropIndex(
            name: "IX_layer_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_codelist");
    }
}
