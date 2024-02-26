using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RenameForeignKeys : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_layer_color_codelist_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_color_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_color_codelist_layer_id_lay_fk",
            schema: "bdms",
            table: "layer_color_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_debris_codelist_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_debris_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_debris_codelist_layer_id_lay_fk",
            schema: "bdms",
            table: "layer_debris_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_grain_angularity_codelist_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_grain_angularity_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_grain_angularity_codelist_layer_id_lay_fk",
            schema: "bdms",
            table: "layer_grain_angularity_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_grain_shape_codelist_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_grain_shape_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_grain_shape_codelist_layer_id_lay_fk",
            schema: "bdms",
            table: "layer_grain_shape_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_organic_component_codelist_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_organic_component_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_organic_component_codelist_layer_id_lay_fk",
            schema: "bdms",
            table: "layer_organic_component_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_uscs3_codelist_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_uscs3_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_uscs3_codelist_layer_id_lay_fk",
            schema: "bdms",
            table: "layer_uscs3_codelist");

        migrationBuilder.RenameColumn(
            name: "id_cli_fk",
            schema: "bdms",
            table: "layer_uscs3_codelist",
            newName: "uscs3_id");

        migrationBuilder.RenameColumn(
            name: "id_lay_fk",
            schema: "bdms",
            table: "layer_uscs3_codelist",
            newName: "layer_id");

        migrationBuilder.RenameIndex(
            name: "IX_layer_uscs3_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_uscs3_codelist",
            newName: "IX_layer_uscs3_codelist_uscs3_id");

        migrationBuilder.RenameColumn(
            name: "id_cli_fk",
            schema: "bdms",
            table: "layer_organic_component_codelist",
            newName: "organic_components_id");

        migrationBuilder.RenameColumn(
            name: "id_lay_fk",
            schema: "bdms",
            table: "layer_organic_component_codelist",
            newName: "layer_id");

        migrationBuilder.RenameIndex(
            name: "IX_layer_organic_component_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_organic_component_codelist",
            newName: "IX_layer_organic_component_codelist_organic_components_id");

        migrationBuilder.RenameColumn(
            name: "id_cli_fk",
            schema: "bdms",
            table: "layer_grain_shape_codelist",
            newName: "grain_shape_id");

        migrationBuilder.RenameColumn(
            name: "id_lay_fk",
            schema: "bdms",
            table: "layer_grain_shape_codelist",
            newName: "layer_id");

        migrationBuilder.RenameIndex(
            name: "IX_layer_grain_shape_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_grain_shape_codelist",
            newName: "IX_layer_grain_shape_codelist_grain_shape_id");

        migrationBuilder.RenameColumn(
            name: "id_cli_fk",
            schema: "bdms",
            table: "layer_grain_angularity_codelist",
            newName: "grain_angularity_id");

        migrationBuilder.RenameColumn(
            name: "id_lay_fk",
            schema: "bdms",
            table: "layer_grain_angularity_codelist",
            newName: "layer_id");

        migrationBuilder.RenameIndex(
            name: "IX_layer_grain_angularity_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_grain_angularity_codelist",
            newName: "IX_layer_grain_angularity_codelist_grain_angularity_id");

        migrationBuilder.RenameColumn(
            name: "id_cli_fk",
            schema: "bdms",
            table: "layer_debris_codelist",
            newName: "debris_id");

        migrationBuilder.RenameColumn(
            name: "id_lay_fk",
            schema: "bdms",
            table: "layer_debris_codelist",
            newName: "layer_id");

        migrationBuilder.RenameIndex(
            name: "IX_layer_debris_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_debris_codelist",
            newName: "IX_layer_debris_codelist_debris_id");

        migrationBuilder.RenameColumn(
            name: "id_cli_fk",
            schema: "bdms",
            table: "layer_color_codelist",
            newName: "color_id");

        migrationBuilder.RenameColumn(
            name: "id_lay_fk",
            schema: "bdms",
            table: "layer_color_codelist",
            newName: "layer_id");

        migrationBuilder.RenameIndex(
            name: "IX_layer_color_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_color_codelist",
            newName: "IX_layer_color_codelist_color_id");

        migrationBuilder.AddForeignKey(
            name: "FK_layer_color_codelist_codelist_color_id",
            schema: "bdms",
            table: "layer_color_codelist",
            column: "color_id",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_color_codelist_layer_layer_id",
            schema: "bdms",
            table: "layer_color_codelist",
            column: "layer_id",
            principalSchema: "bdms",
            principalTable: "layer",
            principalColumn: "id_lay",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_debris_codelist_codelist_debris_id",
            schema: "bdms",
            table: "layer_debris_codelist",
            column: "debris_id",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_debris_codelist_layer_layer_id",
            schema: "bdms",
            table: "layer_debris_codelist",
            column: "layer_id",
            principalSchema: "bdms",
            principalTable: "layer",
            principalColumn: "id_lay",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_grain_angularity_codelist_codelist_grain_angularity_id",
            schema: "bdms",
            table: "layer_grain_angularity_codelist",
            column: "grain_angularity_id",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_grain_angularity_codelist_layer_layer_id",
            schema: "bdms",
            table: "layer_grain_angularity_codelist",
            column: "layer_id",
            principalSchema: "bdms",
            principalTable: "layer",
            principalColumn: "id_lay",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_grain_shape_codelist_codelist_grain_shape_id",
            schema: "bdms",
            table: "layer_grain_shape_codelist",
            column: "grain_shape_id",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_grain_shape_codelist_layer_layer_id",
            schema: "bdms",
            table: "layer_grain_shape_codelist",
            column: "layer_id",
            principalSchema: "bdms",
            principalTable: "layer",
            principalColumn: "id_lay",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_organic_component_codelist_codelist_organic_component~",
            schema: "bdms",
            table: "layer_organic_component_codelist",
            column: "organic_components_id",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_organic_component_codelist_layer_layer_id",
            schema: "bdms",
            table: "layer_organic_component_codelist",
            column: "layer_id",
            principalSchema: "bdms",
            principalTable: "layer",
            principalColumn: "id_lay",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_uscs3_codelist_codelist_uscs3_id",
            schema: "bdms",
            table: "layer_uscs3_codelist",
            column: "uscs3_id",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_uscs3_codelist_layer_layer_id",
            schema: "bdms",
            table: "layer_uscs3_codelist",
            column: "layer_id",
            principalSchema: "bdms",
            principalTable: "layer",
            principalColumn: "id_lay",
            onDelete: ReferentialAction.Cascade);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_layer_color_codelist_codelist_color_id",
            schema: "bdms",
            table: "layer_color_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_color_codelist_layer_layer_id",
            schema: "bdms",
            table: "layer_color_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_debris_codelist_codelist_debris_id",
            schema: "bdms",
            table: "layer_debris_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_debris_codelist_layer_layer_id",
            schema: "bdms",
            table: "layer_debris_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_grain_angularity_codelist_codelist_grain_angularity_id",
            schema: "bdms",
            table: "layer_grain_angularity_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_grain_angularity_codelist_layer_layer_id",
            schema: "bdms",
            table: "layer_grain_angularity_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_grain_shape_codelist_codelist_grain_shape_id",
            schema: "bdms",
            table: "layer_grain_shape_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_grain_shape_codelist_layer_layer_id",
            schema: "bdms",
            table: "layer_grain_shape_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_organic_component_codelist_codelist_organic_component~",
            schema: "bdms",
            table: "layer_organic_component_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_organic_component_codelist_layer_layer_id",
            schema: "bdms",
            table: "layer_organic_component_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_uscs3_codelist_codelist_uscs3_id",
            schema: "bdms",
            table: "layer_uscs3_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_uscs3_codelist_layer_layer_id",
            schema: "bdms",
            table: "layer_uscs3_codelist");

        migrationBuilder.RenameColumn(
            name: "uscs3_id",
            schema: "bdms",
            table: "layer_uscs3_codelist",
            newName: "id_cli_fk");

        migrationBuilder.RenameColumn(
            name: "layer_id",
            schema: "bdms",
            table: "layer_uscs3_codelist",
            newName: "id_lay_fk");

        migrationBuilder.RenameIndex(
            name: "IX_layer_uscs3_codelist_uscs3_id",
            schema: "bdms",
            table: "layer_uscs3_codelist",
            newName: "IX_layer_uscs3_codelist_id_cli_fk");

        migrationBuilder.RenameColumn(
            name: "organic_components_id",
            schema: "bdms",
            table: "layer_organic_component_codelist",
            newName: "id_cli_fk");

        migrationBuilder.RenameColumn(
            name: "layer_id",
            schema: "bdms",
            table: "layer_organic_component_codelist",
            newName: "id_lay_fk");

        migrationBuilder.RenameIndex(
            name: "IX_layer_organic_component_codelist_organic_components_id",
            schema: "bdms",
            table: "layer_organic_component_codelist",
            newName: "IX_layer_organic_component_codelist_id_cli_fk");

        migrationBuilder.RenameColumn(
            name: "grain_shape_id",
            schema: "bdms",
            table: "layer_grain_shape_codelist",
            newName: "id_cli_fk");

        migrationBuilder.RenameColumn(
            name: "layer_id",
            schema: "bdms",
            table: "layer_grain_shape_codelist",
            newName: "id_lay_fk");

        migrationBuilder.RenameIndex(
            name: "IX_layer_grain_shape_codelist_grain_shape_id",
            schema: "bdms",
            table: "layer_grain_shape_codelist",
            newName: "IX_layer_grain_shape_codelist_id_cli_fk");

        migrationBuilder.RenameColumn(
            name: "grain_angularity_id",
            schema: "bdms",
            table: "layer_grain_angularity_codelist",
            newName: "id_cli_fk");

        migrationBuilder.RenameColumn(
            name: "layer_id",
            schema: "bdms",
            table: "layer_grain_angularity_codelist",
            newName: "id_lay_fk");

        migrationBuilder.RenameIndex(
            name: "IX_layer_grain_angularity_codelist_grain_angularity_id",
            schema: "bdms",
            table: "layer_grain_angularity_codelist",
            newName: "IX_layer_grain_angularity_codelist_id_cli_fk");

        migrationBuilder.RenameColumn(
            name: "debris_id",
            schema: "bdms",
            table: "layer_debris_codelist",
            newName: "id_cli_fk");

        migrationBuilder.RenameColumn(
            name: "layer_id",
            schema: "bdms",
            table: "layer_debris_codelist",
            newName: "id_lay_fk");

        migrationBuilder.RenameIndex(
            name: "IX_layer_debris_codelist_debris_id",
            schema: "bdms",
            table: "layer_debris_codelist",
            newName: "IX_layer_debris_codelist_id_cli_fk");

        migrationBuilder.RenameColumn(
            name: "color_id",
            schema: "bdms",
            table: "layer_color_codelist",
            newName: "id_cli_fk");

        migrationBuilder.RenameColumn(
            name: "layer_id",
            schema: "bdms",
            table: "layer_color_codelist",
            newName: "id_lay_fk");

        migrationBuilder.RenameIndex(
            name: "IX_layer_color_codelist_color_id",
            schema: "bdms",
            table: "layer_color_codelist",
            newName: "IX_layer_color_codelist_id_cli_fk");

        migrationBuilder.AddForeignKey(
            name: "FK_layer_color_codelist_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_color_codelist",
            column: "id_cli_fk",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_color_codelist_layer_id_lay_fk",
            schema: "bdms",
            table: "layer_color_codelist",
            column: "id_lay_fk",
            principalSchema: "bdms",
            principalTable: "layer",
            principalColumn: "id_lay",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_debris_codelist_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_debris_codelist",
            column: "id_cli_fk",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_debris_codelist_layer_id_lay_fk",
            schema: "bdms",
            table: "layer_debris_codelist",
            column: "id_lay_fk",
            principalSchema: "bdms",
            principalTable: "layer",
            principalColumn: "id_lay",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_grain_angularity_codelist_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_grain_angularity_codelist",
            column: "id_cli_fk",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_grain_angularity_codelist_layer_id_lay_fk",
            schema: "bdms",
            table: "layer_grain_angularity_codelist",
            column: "id_lay_fk",
            principalSchema: "bdms",
            principalTable: "layer",
            principalColumn: "id_lay",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_grain_shape_codelist_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_grain_shape_codelist",
            column: "id_cli_fk",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_grain_shape_codelist_layer_id_lay_fk",
            schema: "bdms",
            table: "layer_grain_shape_codelist",
            column: "id_lay_fk",
            principalSchema: "bdms",
            principalTable: "layer",
            principalColumn: "id_lay",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_organic_component_codelist_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_organic_component_codelist",
            column: "id_cli_fk",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_organic_component_codelist_layer_id_lay_fk",
            schema: "bdms",
            table: "layer_organic_component_codelist",
            column: "id_lay_fk",
            principalSchema: "bdms",
            principalTable: "layer",
            principalColumn: "id_lay",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_uscs3_codelist_codelist_id_cli_fk",
            schema: "bdms",
            table: "layer_uscs3_codelist",
            column: "id_cli_fk",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_uscs3_codelist_layer_id_lay_fk",
            schema: "bdms",
            table: "layer_uscs3_codelist",
            column: "id_lay_fk",
            principalSchema: "bdms",
            principalTable: "layer",
            principalColumn: "id_lay",
            onDelete: ReferentialAction.Cascade);
    }
}
