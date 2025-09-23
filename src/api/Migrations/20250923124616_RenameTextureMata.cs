using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations
{
    /// <inheritdoc />
    public partial class RenameTextureMata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "lithology_texture_mata_codelist",
                schema: "bdms");

            migrationBuilder.CreateTable(
                name: "lithology_texture_meta_codelist",
                schema: "bdms",
                columns: table => new
                {
                    lithology_id = table.Column<int>(type: "integer", nullable: false),
                    texture_meta_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lithology_texture_meta_codelist", x => new { x.lithology_id, x.texture_meta_id });
                    table.ForeignKey(
                        name: "FK_lithology_texture_meta_codelist_codelist_texture_meta_id",
                        column: x => x.texture_meta_id,
                        principalSchema: "bdms",
                        principalTable: "codelist",
                        principalColumn: "id_cli",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_lithology_texture_meta_codelist_lithology_lithology_id",
                        column: x => x.lithology_id,
                        principalSchema: "bdms",
                        principalTable: "lithology",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_lithology_texture_meta_codelist_texture_meta_id",
                schema: "bdms",
                table: "lithology_texture_meta_codelist",
                column: "texture_meta_id");

            migrationBuilder.Sql(@"
                UPDATE bdms.codelist
                SET schema_cli = 'texture_meta'
                WHERE schema_cli = 'texture_mata';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "lithology_texture_meta_codelist",
                schema: "bdms");

            migrationBuilder.CreateTable(
                name: "lithology_texture_mata_codelist",
                schema: "bdms",
                columns: table => new
                {
                    lithology_id = table.Column<int>(type: "integer", nullable: false),
                    texture_mata_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lithology_texture_mata_codelist", x => new { x.lithology_id, x.texture_mata_id });
                    table.ForeignKey(
                        name: "FK_lithology_texture_mata_codelist_codelist_texture_mata_id",
                        column: x => x.texture_mata_id,
                        principalSchema: "bdms",
                        principalTable: "codelist",
                        principalColumn: "id_cli",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_lithology_texture_mata_codelist_lithology_lithology_id",
                        column: x => x.lithology_id,
                        principalSchema: "bdms",
                        principalTable: "lithology",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_lithology_texture_mata_codelist_texture_mata_id",
                schema: "bdms",
                table: "lithology_texture_mata_codelist",
                column: "texture_mata_id");
        }
    }
}
