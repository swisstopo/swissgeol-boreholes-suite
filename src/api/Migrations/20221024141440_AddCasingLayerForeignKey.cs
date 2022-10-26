using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations
{
    public partial class AddCasingLayerForeignKey : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(schema: "bdms", name: "instr_id_lay_fk", table: "layer", type: "integer", nullable: true);
            migrationBuilder.AddForeignKey(
                schema: "bdms",
                name: "layer_instr_id_lay",
                table: "layer",
                column: "instr_id_lay_fk",
                principalSchema: "bdms",
                principalTable: "layer",
                principalColumn: "id_lay",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "instr_id_lay_fk", table: "layer", schema: "bdms");
            migrationBuilder.DropForeignKey(name: "layer_instr_id_lay", table: "layer", schema: "bdms");
        }
    }
}
