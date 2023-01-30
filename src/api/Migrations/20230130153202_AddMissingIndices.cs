using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class AddMissingIndices : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateIndex(
            name: "IX_layer_users_updater_lay",
            schema: "bdms",
            table: "layer",
            column: "updater_lay");

        migrationBuilder.CreateIndex(
            name: "IX_layer_alteration_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "alteration_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_casng_kind_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "casng_kind_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_casng_material_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "casng_material_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_chronostratigraphy_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "chronostratigraphy_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_cohesion_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "cohesion_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_compactness_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "compactness_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_consistance_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "consistance_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_creator_lay_fkey",
            schema: "bdms",
            table: "layer",
            column: "creator_lay");

        migrationBuilder.CreateIndex(
            name: "IX_layer_fill_kind_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "fill_kind_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_fill_material_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "fill_material_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_grain_size_1_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "grain_size_1_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_grain_size_2_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "grain_size_2_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_humidity_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "humidity_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_id_sty_fk_fkey",
            schema: "bdms",
            table: "layer",
            column: "id_sty_fk");

        migrationBuilder.CreateIndex(
            name: "IX_layer_instr_id_lay",
            schema: "bdms",
            table: "layer",
            column: "instr_id_lay_fk");

        migrationBuilder.CreateIndex(
            name: "IX_layer_instr_kind_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "instr_kind_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_instr_status_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "instr_status_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_lithology_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "lithology_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_lithology_top_bedrock_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "lithology_top_bedrock_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_lithostratigraphy_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "lithostratigraphy_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_plasticity_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "plasticity_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_qt_description_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "qt_description_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_uscs_determination_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "uscs_determination_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_uscs_2_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "uscs_2_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_uscs_1_id_cli_fkey",
            schema: "bdms",
            table: "layer",
            column: "uscs_1_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_updater_lay_fkey",
            schema: "bdms",
            table: "layer",
            column: "updater_lay");

        migrationBuilder.CreateIndex(
            name: "IX_FK_layer_users_creator_lay",
            schema: "bdms",
            table: "layer",
            column: "creator_lay");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_qt_top_bedrock_tvd_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            column: "qt_top_bedrock_tvd_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_cuttings_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            column: "cuttings_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_hrs_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            column: "hrs_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_id_wgp_fk_fkey",
            schema: "bdms",
            table: "borehole",
            column: "id_wgp_fk");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_kind_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            column: "kind_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_lithology_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            column: "lithology_top_bedrock_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_lithostrat_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            column: "lithostrat_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_locked_by_fkey",
            schema: "bdms",
            table: "borehole",
            column: "locked_by_bho");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_method_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            column: "drilling_method_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_purpose_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            column: "purpose_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_qt_bore_inc_dir_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            column: "qt_inclination_direction_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_qt_elevation_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            column: "qt_elevation_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_qt_length_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            column: "qt_depth_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_qt_location_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            column: "qt_location_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_qt_reference_elevation_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            column: "qt_reference_elevation_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_qt_top_bedrock_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            column: "qt_top_bedrock_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_chronostrat_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            column: "chronostrat_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_qt_total_depth_tvd_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            column: "qt_total_depth_tvd_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_reference_elevation_type_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            column: "reference_elevation_type_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_restriction_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            column: "restriction_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_srs_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            column: "srs_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_status_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            column: "status_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_updater_bho_fkey",
            schema: "bdms",
            table: "borehole",
            column: "updated_by_bho");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_codelist_id_cli_fk_fkey",
            schema: "bdms",
            table: "borehole_codelist",
            column: "id_cli_fk");

        migrationBuilder.CreateIndex(
            name: "IX_stratigraphy_kind_id_cli_fkey",
            schema: "bdms",
            table: "stratigraphy",
            column: "kind_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_stratigraphy_updater_sty_fkey",
            schema: "bdms",
            table: "stratigraphy",
            column: "updater_sty");

        migrationBuilder.CreateIndex(
            name: "IX_stratigraphy_author_sty_fkey",
            schema: "bdms",
            table: "stratigraphy",
            column: "author_sty");

        migrationBuilder.CreateIndex(
            name: "IX_stratigraphy_id_bho_fk_fkey",
            schema: "bdms",
            table: "stratigraphy",
            column: "id_bho_fk");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_files_id_usr_fkey",
            schema: "bdms",
            table: "borehole_files",
            column: "id_usr_fk");

        migrationBuilder.CreateIndex(
            name: "IX_workflow_id_usr_fk_fkey",
            schema: "bdms",
            table: "workflow",
            column: "id_usr_fk");

        migrationBuilder.CreateIndex(
            name: "IX_workflow_id_bho_fk_fkey",
            schema: "bdms",
            table: "workflow",
            column: "id_bho_fk");

        migrationBuilder.CreateIndex(
            name: "IX_workflow_id_rol_fk_fkey",
            schema: "bdms",
            table: "workflow",
            column: "id_rol_fk");

        migrationBuilder.CreateIndex(
            name: "IX_files_id_usr_fkey",
            schema: "bdms",
            table: "files",
            column: "id_usr_fk");

        migrationBuilder.CreateIndex(
            name: "IX_users_roles_id_rol_fk_fkey",
            schema: "bdms",
            table: "users_roles",
            column: "id_rol_fk");

        migrationBuilder.CreateIndex(
            name: "IX_users_roles_id_wgp_fk_fkey",
            schema: "bdms",
            table: "users_roles",
            column: "id_wgp_fk");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
