using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class RenameLithologyJoinTableKeys : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_lithology_description_structure_syn_gen_codelist_codelist_l~",
            schema: "bdms",
            table: "lithology_description_structure_syn_gen_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_lithology_texture_mata_codelist_codelist_lithology_texture_~",
            schema: "bdms",
            table: "lithology_texture_mata_codelist");

        migrationBuilder.RenameColumn(
            name: "lithology_texture_mata_id",
            schema: "bdms",
            table: "lithology_texture_mata_codelist",
            newName: "texture_mata_id");

        migrationBuilder.RenameIndex(
            name: "IX_lithology_texture_mata_codelist_lithology_texture_mata_id",
            schema: "bdms",
            table: "lithology_texture_mata_codelist",
            newName: "IX_lithology_texture_mata_codelist_texture_mata_id");

        migrationBuilder.RenameColumn(
            name: "lithology_structure_syn_gen_id",
            schema: "bdms",
            table: "lithology_description_structure_syn_gen_codelist",
            newName: "structure_syn_gen_id");

        migrationBuilder.RenameIndex(
            name: "IX_lithology_description_structure_syn_gen_codelist_lithology_~",
            schema: "bdms",
            table: "lithology_description_structure_syn_gen_codelist",
            newName: "IX_lithology_description_structure_syn_gen_codelist_structure_~");

        migrationBuilder.RenameColumn(
            name: "lithology_structure_post_gen_id",
            schema: "bdms",
            table: "lithology_description_structure_post_gen_codelist",
            newName: "structure_post_gen_id");

        migrationBuilder.RenameIndex(
            name: "IX_lithology_description_structure_post_gen_codelist_lithology~",
            schema: "bdms",
            table: "lithology_description_structure_post_gen_codelist",
            newName: "IX_lithology_description_structure_post_gen_codelist_structure~");

        migrationBuilder.RenameColumn(
            name: "lithology_component_con_particle_id",
            schema: "bdms",
            table: "lithology_description_component_con_particle_codelist",
            newName: "component_con_particle_id");

        migrationBuilder.RenameIndex(
            name: "IX_lithology_description_component_con_particle_codelist_litho~",
            schema: "bdms",
            table: "lithology_description_component_con_particle_codelist",
            newName: "IX_lithology_description_component_con_particle_codelist_compo~");

        migrationBuilder.RenameColumn(
            name: "lithology_component_con_mineral_id",
            schema: "bdms",
            table: "lithology_description_component_con_mineral_codelist",
            newName: "component_con_mineral_id");

        migrationBuilder.RenameIndex(
            name: "IX_lithology_description_component_con_mineral_codelist_lithol~",
            schema: "bdms",
            table: "lithology_description_component_con_mineral_codelist",
            newName: "IX_lithology_description_component_con_mineral_codelist_compon~");

        migrationBuilder.AddForeignKey(
            name: "FK_lithology_description_structure_syn_gen_codelist_codelist_s~",
            schema: "bdms",
            table: "lithology_description_structure_syn_gen_codelist",
            column: "structure_syn_gen_id",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_lithology_texture_mata_codelist_codelist_texture_mata_id",
            schema: "bdms",
            table: "lithology_texture_mata_codelist",
            column: "texture_mata_id",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_lithology_description_structure_syn_gen_codelist_codelist_s~",
            schema: "bdms",
            table: "lithology_description_structure_syn_gen_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_lithology_texture_mata_codelist_codelist_texture_mata_id",
            schema: "bdms",
            table: "lithology_texture_mata_codelist");

        migrationBuilder.RenameColumn(
            name: "texture_mata_id",
            schema: "bdms",
            table: "lithology_texture_mata_codelist",
            newName: "lithology_texture_mata_id");

        migrationBuilder.RenameIndex(
            name: "IX_lithology_texture_mata_codelist_texture_mata_id",
            schema: "bdms",
            table: "lithology_texture_mata_codelist",
            newName: "IX_lithology_texture_mata_codelist_lithology_texture_mata_id");

        migrationBuilder.RenameColumn(
            name: "structure_syn_gen_id",
            schema: "bdms",
            table: "lithology_description_structure_syn_gen_codelist",
            newName: "lithology_structure_syn_gen_id");

        migrationBuilder.RenameIndex(
            name: "IX_lithology_description_structure_syn_gen_codelist_structure_~",
            schema: "bdms",
            table: "lithology_description_structure_syn_gen_codelist",
            newName: "IX_lithology_description_structure_syn_gen_codelist_lithology_~");

        migrationBuilder.RenameColumn(
            name: "structure_post_gen_id",
            schema: "bdms",
            table: "lithology_description_structure_post_gen_codelist",
            newName: "lithology_structure_post_gen_id");

        migrationBuilder.RenameIndex(
            name: "IX_lithology_description_structure_post_gen_codelist_structure~",
            schema: "bdms",
            table: "lithology_description_structure_post_gen_codelist",
            newName: "IX_lithology_description_structure_post_gen_codelist_lithology~");

        migrationBuilder.RenameColumn(
            name: "component_con_particle_id",
            schema: "bdms",
            table: "lithology_description_component_con_particle_codelist",
            newName: "lithology_component_con_particle_id");

        migrationBuilder.RenameIndex(
            name: "IX_lithology_description_component_con_particle_codelist_compo~",
            schema: "bdms",
            table: "lithology_description_component_con_particle_codelist",
            newName: "IX_lithology_description_component_con_particle_codelist_litho~");

        migrationBuilder.RenameColumn(
            name: "component_con_mineral_id",
            schema: "bdms",
            table: "lithology_description_component_con_mineral_codelist",
            newName: "lithology_component_con_mineral_id");

        migrationBuilder.RenameIndex(
            name: "IX_lithology_description_component_con_mineral_codelist_compon~",
            schema: "bdms",
            table: "lithology_description_component_con_mineral_codelist",
            newName: "IX_lithology_description_component_con_mineral_codelist_lithol~");

        migrationBuilder.AddForeignKey(
            name: "FK_lithology_description_structure_syn_gen_codelist_codelist_l~",
            schema: "bdms",
            table: "lithology_description_structure_syn_gen_codelist",
            column: "lithology_structure_syn_gen_id",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_lithology_texture_mata_codelist_codelist_lithology_texture_~",
            schema: "bdms",
            table: "lithology_texture_mata_codelist",
            column: "lithology_texture_mata_id",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);
    }
}
#pragma warning restore CA1505
