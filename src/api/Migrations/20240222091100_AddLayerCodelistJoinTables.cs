using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddLayerCodelistJoinTables : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "layer_color_codelist",
            schema: "bdms",
            columns: table => new
            {
                id_lay_fk = table.Column<int>(type: "integer", nullable: false),
                id_cli_fk = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_layer_color_codelist", x => new { x.id_lay_fk, x.id_cli_fk });
                table.ForeignKey(
                    name: "FK_layer_color_codelist_codelist_id_cli_fk",
                    column: x => x.id_cli_fk,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_layer_color_codelist_layer_id_lay_fk",
                    column: x => x.id_lay_fk,
                    principalSchema: "bdms",
                    principalTable: "layer",
                    principalColumn: "id_lay",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "layer_debris_codelist",
            schema: "bdms",
            columns: table => new
            {
                id_lay_fk = table.Column<int>(type: "integer", nullable: false),
                id_cli_fk = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_layer_debris_codelist", x => new { x.id_lay_fk, x.id_cli_fk });
                table.ForeignKey(
                    name: "FK_layer_debris_codelist_codelist_id_cli_fk",
                    column: x => x.id_cli_fk,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_layer_debris_codelist_layer_id_lay_fk",
                    column: x => x.id_lay_fk,
                    principalSchema: "bdms",
                    principalTable: "layer",
                    principalColumn: "id_lay",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "layer_grain_angularity_codelist",
            schema: "bdms",
            columns: table => new
            {
                id_lay_fk = table.Column<int>(type: "integer", nullable: false),
                id_cli_fk = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_layer_grain_angularity_codelist", x => new { x.id_lay_fk, x.id_cli_fk });
                table.ForeignKey(
                    name: "FK_layer_grain_angularity_codelist_codelist_id_cli_fk",
                    column: x => x.id_cli_fk,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_layer_grain_angularity_codelist_layer_id_lay_fk",
                    column: x => x.id_lay_fk,
                    principalSchema: "bdms",
                    principalTable: "layer",
                    principalColumn: "id_lay",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "layer_grain_shape_codelist",
            schema: "bdms",
            columns: table => new
            {
                id_lay_fk = table.Column<int>(type: "integer", nullable: false),
                id_cli_fk = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_layer_grain_shape_codelist", x => new { x.id_lay_fk, x.id_cli_fk });
                table.ForeignKey(
                    name: "FK_layer_grain_shape_codelist_codelist_id_cli_fk",
                    column: x => x.id_cli_fk,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_layer_grain_shape_codelist_layer_id_lay_fk",
                    column: x => x.id_lay_fk,
                    principalSchema: "bdms",
                    principalTable: "layer",
                    principalColumn: "id_lay",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "layer_organic_component_codelist",
            schema: "bdms",
            columns: table => new
            {
                id_lay_fk = table.Column<int>(type: "integer", nullable: false),
                id_cli_fk = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_layer_organic_component_codelist", x => new { x.id_lay_fk, x.id_cli_fk });
                table.ForeignKey(
                    name: "FK_layer_organic_component_codelist_codelist_id_cli_fk",
                    column: x => x.id_cli_fk,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_layer_organic_component_codelist_layer_id_lay_fk",
                    column: x => x.id_lay_fk,
                    principalSchema: "bdms",
                    principalTable: "layer",
                    principalColumn: "id_lay",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "layer_uscs3_codelist",
            schema: "bdms",
            columns: table => new
            {
                id_lay_fk = table.Column<int>(type: "integer", nullable: false),
                id_cli_fk = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_layer_uscs3_codelist", x => new { x.id_lay_fk, x.id_cli_fk });
                table.ForeignKey(
                    name: "FK_layer_uscs3_codelist_codelist_id_cli_fk",
                    column: x => x.id_cli_fk,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_layer_uscs3_codelist_layer_id_lay_fk",
                    column: x => x.id_lay_fk,
                    principalSchema: "bdms",
                    principalTable: "layer",
                    principalColumn: "id_lay",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_layer_color_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_color_codelist",
            column: "id_cli_fk");

        migrationBuilder.CreateIndex(
            name: "IX_layer_debris_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_debris_codelist",
            column: "id_cli_fk");

        migrationBuilder.CreateIndex(
            name: "IX_layer_grain_angularity_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_grain_angularity_codelist",
            column: "id_cli_fk");

        migrationBuilder.CreateIndex(
            name: "IX_layer_grain_shape_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_grain_shape_codelist",
            column: "id_cli_fk");

        migrationBuilder.CreateIndex(
            name: "IX_layer_organic_component_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_organic_component_codelist",
            column: "id_cli_fk");

        migrationBuilder.CreateIndex(
            name: "IX_layer_uscs3_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_uscs3_codelist",
            column: "id_cli_fk");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "layer_color_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "layer_debris_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "layer_grain_angularity_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "layer_grain_shape_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "layer_organic_component_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "layer_uscs3_codelist",
            schema: "bdms");
    }
}
