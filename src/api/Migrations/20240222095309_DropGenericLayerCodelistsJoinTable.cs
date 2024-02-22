using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations
{
    /// <inheritdoc />
    public partial class DropGenericLayerCodelistsJoinTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "layer_codelist",
                schema: "bdms");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "layer_codelist",
                schema: "bdms",
                columns: table => new
                {
                    id_lay_fk = table.Column<int>(type: "integer", nullable: false),
                    id_cli_fk = table.Column<int>(type: "integer", nullable: false),
                    code_cli = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_layer_codelist", x => new { x.id_lay_fk, x.id_cli_fk });
                    table.ForeignKey(
                        name: "FK_layer_codelist_codelist_id_cli_fk",
                        column: x => x.id_cli_fk,
                        principalSchema: "bdms",
                        principalTable: "codelist",
                        principalColumn: "id_cli",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_layer_codelist_layer_id_lay_fk",
                        column: x => x.id_lay_fk,
                        principalSchema: "bdms",
                        principalTable: "layer",
                        principalColumn: "id_lay",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_layer_codelist_id_cli_fk",
                schema: "bdms",
                table: "layer_codelist",
                column: "id_cli_fk");
        }
    }
}
