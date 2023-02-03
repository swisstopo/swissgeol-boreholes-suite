using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations
{
    public partial class MakeLayerStratigraphyFKRequired : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_facies_description_stratigraphy_id_sty_fk",
                schema: "bdms",
                table: "facies_description");

            migrationBuilder.DropForeignKey(
                name: "FK_layer_stratigraphy_id_sty_fk",
                schema: "bdms",
                table: "layer");

            migrationBuilder.DropForeignKey(
                name: "FK_lithological_description_stratigraphy_id_sty_fk",
                schema: "bdms",
                table: "lithological_description");

            migrationBuilder.AlterColumn<int>(
                name: "id_sty_fk",
                schema: "bdms",
                table: "lithological_description",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id_sty_fk",
                schema: "bdms",
                table: "layer",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id_sty_fk",
                schema: "bdms",
                table: "facies_description",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_facies_description_stratigraphy_id_sty_fk",
                schema: "bdms",
                table: "facies_description",
                column: "id_sty_fk",
                principalSchema: "bdms",
                principalTable: "stratigraphy",
                principalColumn: "id_sty",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_layer_stratigraphy_id_sty_fk",
                schema: "bdms",
                table: "layer",
                column: "id_sty_fk",
                principalSchema: "bdms",
                principalTable: "stratigraphy",
                principalColumn: "id_sty",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_lithological_description_stratigraphy_id_sty_fk",
                schema: "bdms",
                table: "lithological_description",
                column: "id_sty_fk",
                principalSchema: "bdms",
                principalTable: "stratigraphy",
                principalColumn: "id_sty",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_facies_description_stratigraphy_id_sty_fk",
                schema: "bdms",
                table: "facies_description");

            migrationBuilder.DropForeignKey(
                name: "FK_layer_stratigraphy_id_sty_fk",
                schema: "bdms",
                table: "layer");

            migrationBuilder.DropForeignKey(
                name: "FK_lithological_description_stratigraphy_id_sty_fk",
                schema: "bdms",
                table: "lithological_description");

            migrationBuilder.AlterColumn<int>(
                name: "id_sty_fk",
                schema: "bdms",
                table: "lithological_description",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "id_sty_fk",
                schema: "bdms",
                table: "layer",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "id_sty_fk",
                schema: "bdms",
                table: "facies_description",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_facies_description_stratigraphy_id_sty_fk",
                schema: "bdms",
                table: "facies_description",
                column: "id_sty_fk",
                principalSchema: "bdms",
                principalTable: "stratigraphy",
                principalColumn: "id_sty");

            migrationBuilder.AddForeignKey(
                name: "FK_layer_stratigraphy_id_sty_fk",
                schema: "bdms",
                table: "layer",
                column: "id_sty_fk",
                principalSchema: "bdms",
                principalTable: "stratigraphy",
                principalColumn: "id_sty");

            migrationBuilder.AddForeignKey(
                name: "FK_lithological_description_stratigraphy_id_sty_fk",
                schema: "bdms",
                table: "lithological_description",
                column: "id_sty_fk",
                principalSchema: "bdms",
                principalTable: "stratigraphy",
                principalColumn: "id_sty");
        }
    }
}
