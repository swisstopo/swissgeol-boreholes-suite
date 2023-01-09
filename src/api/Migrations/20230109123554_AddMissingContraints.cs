using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class AddMissingContraints : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateIndex(
            name: "IX_stratigraphy_fill_casng_id_sty_fk",
            schema: "bdms",
            table: "stratigraphy",
            column: "fill_casng_id_sty_fk");

        migrationBuilder.CreateIndex(
            name: "IX_layer_gradation_id_cli",
            schema: "bdms",
            table: "layer",
            column: "gradation_id_cli");

        migrationBuilder.AddForeignKey(
            name: "FK_layer_codelist_gradation_id_cli",
            schema: "bdms",
            table: "layer",
            column: "gradation_id_cli",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli");

        migrationBuilder.AddForeignKey(
            name: "FK_stratigraphy_stratigraphy_fill_casng_id_sty_fk",
            schema: "bdms",
            table: "stratigraphy",
            column: "fill_casng_id_sty_fk",
            principalSchema: "bdms",
            principalTable: "stratigraphy",
            principalColumn: "id_sty");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_layer_codelist_gradation_id_cli",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropForeignKey(
            name: "FK_stratigraphy_stratigraphy_fill_casng_id_sty_fk",
            schema: "bdms",
            table: "stratigraphy");

        migrationBuilder.DropIndex(
            name: "IX_stratigraphy_fill_casng_id_sty_fk",
            schema: "bdms",
            table: "stratigraphy");

        migrationBuilder.DropIndex(
            name: "IX_layer_gradation_id_cli",
            schema: "bdms",
            table: "layer");
    }
}
