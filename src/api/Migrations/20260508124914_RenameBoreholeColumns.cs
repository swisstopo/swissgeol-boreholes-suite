using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations
{
    /// <inheritdoc />
    public partial class RenameBoreholeColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_chronostrat_id_cli",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_hrs_id_cli",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_lithology_top_bedrock_id_cli",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_lithostrat_id_cli",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_purpose_id_cli",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_qt_depth_id_cli",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_qt_elevation_id_cli",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_qt_location_id_cli",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_qt_reference_elevation_id_cli",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_reference_elevation_type_id_cli",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_restriction_id_cli",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_status_id_cli",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_users_created_by_bho",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_users_locked_by_bho",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_users_updated_by_bho",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_workgroups_id_wgp_fk",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.RenameColumn(
                name: "updated_by_bho",
                schema: "bdms",
                table: "borehole",
                newName: "updated");

            migrationBuilder.RenameColumn(
                name: "updated_bho",
                schema: "bdms",
                table: "borehole",
                newName: "updater");

            migrationBuilder.RenameColumn(
                name: "total_depth_bho",
                schema: "bdms",
                table: "borehole",
                newName: "total_depth");

            migrationBuilder.RenameColumn(
                name: "status_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "status_id");

            migrationBuilder.RenameColumn(
                name: "srs_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "srs_id");

            migrationBuilder.RenameColumn(
                name: "restriction_until_bho",
                schema: "bdms",
                table: "borehole",
                newName: "restriction_until");

            migrationBuilder.RenameColumn(
                name: "restriction_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "restriction_id");

            migrationBuilder.RenameColumn(
                name: "remarks_bho",
                schema: "bdms",
                table: "borehole",
                newName: "remarks");

            migrationBuilder.RenameColumn(
                name: "reference_elevation_type_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "reference_elevation_type_id");

            migrationBuilder.RenameColumn(
                name: "reference_elevation_bho",
                schema: "bdms",
                table: "borehole",
                newName: "reference_elevation");

            migrationBuilder.RenameColumn(
                name: "qt_reference_elevation_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "precision_reference_elevation_id");

            migrationBuilder.RenameColumn(
                name: "qt_location_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "precision_location_id");

            migrationBuilder.RenameColumn(
                name: "qt_elevation_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "precision_elevation_id");

            migrationBuilder.RenameColumn(
                name: "qt_depth_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "precision_depth_id");

            migrationBuilder.RenameColumn(
                name: "purpose_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "purpose_id");

            migrationBuilder.RenameColumn(
                name: "public_bho",
                schema: "bdms",
                table: "borehole",
                newName: "public");

            migrationBuilder.RenameColumn(
                name: "project_name_bho",
                schema: "bdms",
                table: "borehole",
                newName: "project_name");

            migrationBuilder.RenameColumn(
                name: "original_name_bho",
                schema: "bdms",
                table: "borehole",
                newName: "original_name");

            migrationBuilder.RenameColumn(
                name: "municipality_bho",
                schema: "bdms",
                table: "borehole",
                newName: "municipality");

            migrationBuilder.RenameColumn(
                name: "locked_by_bho",
                schema: "bdms",
                table: "borehole",
                newName: "locked_by");

            migrationBuilder.RenameColumn(
                name: "locked_bho",
                schema: "bdms",
                table: "borehole",
                newName: "locked");

            migrationBuilder.RenameColumn(
                name: "location_y_lv03_bho",
                schema: "bdms",
                table: "borehole",
                newName: "location_y_lv03");

            migrationBuilder.RenameColumn(
                name: "location_y_bho",
                schema: "bdms",
                table: "borehole",
                newName: "location_y");

            migrationBuilder.RenameColumn(
                name: "location_x_lv03_bho",
                schema: "bdms",
                table: "borehole",
                newName: "location_x_lv03");

            migrationBuilder.RenameColumn(
                name: "location_x_bho",
                schema: "bdms",
                table: "borehole",
                newName: "location_x");

            migrationBuilder.RenameColumn(
                name: "lithostrat_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "lithostratigraphy_top_bedrock_id");

            migrationBuilder.RenameColumn(
                name: "lithology_top_bedrock_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "lithology_top_bedrock_id");

            migrationBuilder.RenameColumn(
                name: "id_wgp_fk",
                schema: "bdms",
                table: "borehole",
                newName: "workgroup_id");

            migrationBuilder.RenameColumn(
                name: "hrs_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "hrs_id");

            migrationBuilder.RenameColumn(
                name: "groundwater_bho",
                schema: "bdms",
                table: "borehole",
                newName: "groundwater");

            migrationBuilder.RenameColumn(
                name: "geom_bho",
                schema: "bdms",
                table: "borehole",
                newName: "geometry");

            migrationBuilder.RenameColumn(
                name: "elevation_z_bho",
                schema: "bdms",
                table: "borehole",
                newName: "elevation_z");

            migrationBuilder.RenameColumn(
                name: "created_by_bho",
                schema: "bdms",
                table: "borehole",
                newName: "creator");

            migrationBuilder.RenameColumn(
                name: "created_bho",
                schema: "bdms",
                table: "borehole",
                newName: "creation");

            migrationBuilder.RenameColumn(
                name: "country_bho",
                schema: "bdms",
                table: "borehole",
                newName: "country");

            migrationBuilder.RenameColumn(
                name: "chronostrat_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "chronostratigraphy_top_bedrock_id");

            migrationBuilder.RenameColumn(
                name: "canton_bho",
                schema: "bdms",
                table: "borehole",
                newName: "canton");

            migrationBuilder.RenameColumn(
                name: "alternate_name_bho",
                schema: "bdms",
                table: "borehole",
                newName: "alternate_name");

            migrationBuilder.RenameColumn(
                name: "id_bho",
                schema: "bdms",
                table: "borehole",
                newName: "id");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_updated_by_bho",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_updated");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_status_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_status_id");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_restriction_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_restriction_id");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_reference_elevation_type_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_reference_elevation_type_id");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_qt_reference_elevation_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_precision_reference_elevation_id");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_qt_location_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_precision_location_id");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_qt_elevation_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_precision_elevation_id");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_qt_depth_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_precision_depth_id");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_purpose_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_purpose_id");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_locked_by_bho",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_locked_by");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_lithostrat_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_lithostratigraphy_top_bedrock_id");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_lithology_top_bedrock_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_lithology_top_bedrock_id");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_id_wgp_fk",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_workgroup_id");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_hrs_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_hrs_id");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_created_by_bho",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_creator");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_chronostrat_id_cli",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_chronostratigraphy_top_bedrock_id");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_chronostratigraphy_top_bedrock_id",
                schema: "bdms",
                table: "borehole",
                column: "chronostratigraphy_top_bedrock_id",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_hrs_id",
                schema: "bdms",
                table: "borehole",
                column: "hrs_id",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_lithology_top_bedrock_id",
                schema: "bdms",
                table: "borehole",
                column: "lithology_top_bedrock_id",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_lithostratigraphy_top_bedrock_id",
                schema: "bdms",
                table: "borehole",
                column: "lithostratigraphy_top_bedrock_id",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_precision_depth_id",
                schema: "bdms",
                table: "borehole",
                column: "precision_depth_id",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_precision_elevation_id",
                schema: "bdms",
                table: "borehole",
                column: "precision_elevation_id",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_precision_location_id",
                schema: "bdms",
                table: "borehole",
                column: "precision_location_id",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_precision_reference_elevation_id",
                schema: "bdms",
                table: "borehole",
                column: "precision_reference_elevation_id",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_purpose_id",
                schema: "bdms",
                table: "borehole",
                column: "purpose_id",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_reference_elevation_type_id",
                schema: "bdms",
                table: "borehole",
                column: "reference_elevation_type_id",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_restriction_id",
                schema: "bdms",
                table: "borehole",
                column: "restriction_id",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_status_id",
                schema: "bdms",
                table: "borehole",
                column: "status_id",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_users_creator",
                schema: "bdms",
                table: "borehole",
                column: "creator",
                principalSchema: "bdms",
                principalTable: "users",
                principalColumn: "id_usr");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_users_locked_by",
                schema: "bdms",
                table: "borehole",
                column: "locked_by",
                principalSchema: "bdms",
                principalTable: "users",
                principalColumn: "id_usr");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_users_updated",
                schema: "bdms",
                table: "borehole",
                column: "updated",
                principalSchema: "bdms",
                principalTable: "users",
                principalColumn: "id_usr");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_workgroups_workgroup_id",
                schema: "bdms",
                table: "borehole",
                column: "workgroup_id",
                principalSchema: "bdms",
                principalTable: "workgroups",
                principalColumn: "id_wgp");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_chronostratigraphy_top_bedrock_id",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_hrs_id",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_lithology_top_bedrock_id",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_lithostratigraphy_top_bedrock_id",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_precision_depth_id",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_precision_elevation_id",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_precision_location_id",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_precision_reference_elevation_id",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_purpose_id",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_reference_elevation_type_id",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_restriction_id",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_codelist_status_id",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_users_creator",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_users_locked_by",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_users_updated",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropForeignKey(
                name: "FK_borehole_workgroups_workgroup_id",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.RenameColumn(
                name: "workgroup_id",
                schema: "bdms",
                table: "borehole",
                newName: "id_wgp_fk");

            migrationBuilder.RenameColumn(
                name: "updater",
                schema: "bdms",
                table: "borehole",
                newName: "updated_bho");

            migrationBuilder.RenameColumn(
                name: "updated",
                schema: "bdms",
                table: "borehole",
                newName: "updated_by_bho");

            migrationBuilder.RenameColumn(
                name: "total_depth",
                schema: "bdms",
                table: "borehole",
                newName: "total_depth_bho");

            migrationBuilder.RenameColumn(
                name: "status_id",
                schema: "bdms",
                table: "borehole",
                newName: "status_id_cli");

            migrationBuilder.RenameColumn(
                name: "srs_id",
                schema: "bdms",
                table: "borehole",
                newName: "srs_id_cli");

            migrationBuilder.RenameColumn(
                name: "restriction_until",
                schema: "bdms",
                table: "borehole",
                newName: "restriction_until_bho");

            migrationBuilder.RenameColumn(
                name: "restriction_id",
                schema: "bdms",
                table: "borehole",
                newName: "restriction_id_cli");

            migrationBuilder.RenameColumn(
                name: "remarks",
                schema: "bdms",
                table: "borehole",
                newName: "remarks_bho");

            migrationBuilder.RenameColumn(
                name: "reference_elevation_type_id",
                schema: "bdms",
                table: "borehole",
                newName: "reference_elevation_type_id_cli");

            migrationBuilder.RenameColumn(
                name: "reference_elevation",
                schema: "bdms",
                table: "borehole",
                newName: "reference_elevation_bho");

            migrationBuilder.RenameColumn(
                name: "purpose_id",
                schema: "bdms",
                table: "borehole",
                newName: "purpose_id_cli");

            migrationBuilder.RenameColumn(
                name: "public",
                schema: "bdms",
                table: "borehole",
                newName: "public_bho");

            migrationBuilder.RenameColumn(
                name: "project_name",
                schema: "bdms",
                table: "borehole",
                newName: "project_name_bho");

            migrationBuilder.RenameColumn(
                name: "precision_reference_elevation_id",
                schema: "bdms",
                table: "borehole",
                newName: "qt_reference_elevation_id_cli");

            migrationBuilder.RenameColumn(
                name: "precision_location_id",
                schema: "bdms",
                table: "borehole",
                newName: "qt_location_id_cli");

            migrationBuilder.RenameColumn(
                name: "precision_elevation_id",
                schema: "bdms",
                table: "borehole",
                newName: "qt_elevation_id_cli");

            migrationBuilder.RenameColumn(
                name: "precision_depth_id",
                schema: "bdms",
                table: "borehole",
                newName: "qt_depth_id_cli");

            migrationBuilder.RenameColumn(
                name: "original_name",
                schema: "bdms",
                table: "borehole",
                newName: "original_name_bho");

            migrationBuilder.RenameColumn(
                name: "municipality",
                schema: "bdms",
                table: "borehole",
                newName: "municipality_bho");

            migrationBuilder.RenameColumn(
                name: "locked_by",
                schema: "bdms",
                table: "borehole",
                newName: "locked_by_bho");

            migrationBuilder.RenameColumn(
                name: "locked",
                schema: "bdms",
                table: "borehole",
                newName: "locked_bho");

            migrationBuilder.RenameColumn(
                name: "location_y_lv03",
                schema: "bdms",
                table: "borehole",
                newName: "location_y_lv03_bho");

            migrationBuilder.RenameColumn(
                name: "location_y",
                schema: "bdms",
                table: "borehole",
                newName: "location_y_bho");

            migrationBuilder.RenameColumn(
                name: "location_x_lv03",
                schema: "bdms",
                table: "borehole",
                newName: "location_x_lv03_bho");

            migrationBuilder.RenameColumn(
                name: "location_x",
                schema: "bdms",
                table: "borehole",
                newName: "location_x_bho");

            migrationBuilder.RenameColumn(
                name: "lithostratigraphy_top_bedrock_id",
                schema: "bdms",
                table: "borehole",
                newName: "lithostrat_id_cli");

            migrationBuilder.RenameColumn(
                name: "lithology_top_bedrock_id",
                schema: "bdms",
                table: "borehole",
                newName: "lithology_top_bedrock_id_cli");

            migrationBuilder.RenameColumn(
                name: "hrs_id",
                schema: "bdms",
                table: "borehole",
                newName: "hrs_id_cli");

            migrationBuilder.RenameColumn(
                name: "groundwater",
                schema: "bdms",
                table: "borehole",
                newName: "groundwater_bho");

            migrationBuilder.RenameColumn(
                name: "geometry",
                schema: "bdms",
                table: "borehole",
                newName: "geom_bho");

            migrationBuilder.RenameColumn(
                name: "elevation_z",
                schema: "bdms",
                table: "borehole",
                newName: "elevation_z_bho");

            migrationBuilder.RenameColumn(
                name: "creator",
                schema: "bdms",
                table: "borehole",
                newName: "created_by_bho");

            migrationBuilder.RenameColumn(
                name: "creation",
                schema: "bdms",
                table: "borehole",
                newName: "created_bho");

            migrationBuilder.RenameColumn(
                name: "country",
                schema: "bdms",
                table: "borehole",
                newName: "country_bho");

            migrationBuilder.RenameColumn(
                name: "chronostratigraphy_top_bedrock_id",
                schema: "bdms",
                table: "borehole",
                newName: "chronostrat_id_cli");

            migrationBuilder.RenameColumn(
                name: "canton",
                schema: "bdms",
                table: "borehole",
                newName: "canton_bho");

            migrationBuilder.RenameColumn(
                name: "alternate_name",
                schema: "bdms",
                table: "borehole",
                newName: "alternate_name_bho");

            migrationBuilder.RenameColumn(
                name: "id",
                schema: "bdms",
                table: "borehole",
                newName: "id_bho");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_workgroup_id",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_id_wgp_fk");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_updated",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_updated_by_bho");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_status_id",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_status_id_cli");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_restriction_id",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_restriction_id_cli");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_reference_elevation_type_id",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_reference_elevation_type_id_cli");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_purpose_id",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_purpose_id_cli");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_precision_reference_elevation_id",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_qt_reference_elevation_id_cli");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_precision_location_id",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_qt_location_id_cli");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_precision_elevation_id",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_qt_elevation_id_cli");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_precision_depth_id",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_qt_depth_id_cli");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_locked_by",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_locked_by_bho");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_lithostratigraphy_top_bedrock_id",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_lithostrat_id_cli");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_lithology_top_bedrock_id",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_lithology_top_bedrock_id_cli");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_hrs_id",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_hrs_id_cli");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_creator",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_created_by_bho");

            migrationBuilder.RenameIndex(
                name: "IX_borehole_chronostratigraphy_top_bedrock_id",
                schema: "bdms",
                table: "borehole",
                newName: "IX_borehole_chronostrat_id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_chronostrat_id_cli",
                schema: "bdms",
                table: "borehole",
                column: "chronostrat_id_cli",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_hrs_id_cli",
                schema: "bdms",
                table: "borehole",
                column: "hrs_id_cli",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_lithology_top_bedrock_id_cli",
                schema: "bdms",
                table: "borehole",
                column: "lithology_top_bedrock_id_cli",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_lithostrat_id_cli",
                schema: "bdms",
                table: "borehole",
                column: "lithostrat_id_cli",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_purpose_id_cli",
                schema: "bdms",
                table: "borehole",
                column: "purpose_id_cli",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_qt_depth_id_cli",
                schema: "bdms",
                table: "borehole",
                column: "qt_depth_id_cli",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_qt_elevation_id_cli",
                schema: "bdms",
                table: "borehole",
                column: "qt_elevation_id_cli",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_qt_location_id_cli",
                schema: "bdms",
                table: "borehole",
                column: "qt_location_id_cli",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_qt_reference_elevation_id_cli",
                schema: "bdms",
                table: "borehole",
                column: "qt_reference_elevation_id_cli",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_reference_elevation_type_id_cli",
                schema: "bdms",
                table: "borehole",
                column: "reference_elevation_type_id_cli",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_restriction_id_cli",
                schema: "bdms",
                table: "borehole",
                column: "restriction_id_cli",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_codelist_status_id_cli",
                schema: "bdms",
                table: "borehole",
                column: "status_id_cli",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_users_created_by_bho",
                schema: "bdms",
                table: "borehole",
                column: "created_by_bho",
                principalSchema: "bdms",
                principalTable: "users",
                principalColumn: "id_usr");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_users_locked_by_bho",
                schema: "bdms",
                table: "borehole",
                column: "locked_by_bho",
                principalSchema: "bdms",
                principalTable: "users",
                principalColumn: "id_usr");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_users_updated_by_bho",
                schema: "bdms",
                table: "borehole",
                column: "updated_by_bho",
                principalSchema: "bdms",
                principalTable: "users",
                principalColumn: "id_usr");

            migrationBuilder.AddForeignKey(
                name: "FK_borehole_workgroups_id_wgp_fk",
                schema: "bdms",
                table: "borehole",
                column: "id_wgp_fk",
                principalSchema: "bdms",
                principalTable: "workgroups",
                principalColumn: "id_wgp");
        }
    }
}
