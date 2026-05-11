using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RenameBoreholeColumns : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "borehole_chronostrat_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropForeignKey(
            name: "borehole_hrs_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropForeignKey(
            name: "borehole_lithology_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropForeignKey(
            name: "borehole_lithostrat_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropForeignKey(
            name: "borehole_purpose_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropForeignKey(
            name: "borehole_qt_length_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropForeignKey(
            name: "borehole_qt_elevation_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropForeignKey(
            name: "borehole_qt_location_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropForeignKey(
            name: "borehole_qt_reference_elevation_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropForeignKey(
            name: "borehole_reference_elevation_type_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropForeignKey(
            name: "borehole_restriction_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropForeignKey(
            name: "borehole_status_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropForeignKey(
            name: "borehole_borehole_type_id_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropForeignKey(
            name: "borehole_locked_by_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropForeignKey(
            name: "borehole_updater_bho_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropForeignKey(
            name: "borehole_id_wgp_fk_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropForeignKey(
            name: "borehole_srs_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropIndex(
            name: "IX_borehole_srs_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.RenameColumn(
            name: "updated_by_bho",
            schema: "bdms",
            table: "borehole",
            newName: "updater");

        migrationBuilder.RenameColumn(
            name: "updated_bho",
            schema: "bdms",
            table: "borehole",
            newName: "update");

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
            name: "IX_borehole_updater_bho_fkey",
            schema: "bdms",
            table: "borehole",
            newName: "IX_borehole_updater");

        migrationBuilder.RenameIndex(
            name: "IX_borehole_status_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            newName: "IX_borehole_status_id");

        migrationBuilder.RenameIndex(
            name: "IX_borehole_restriction_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            newName: "IX_borehole_restriction_id");

        migrationBuilder.RenameIndex(
            name: "IX_borehole_reference_elevation_type_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            newName: "IX_borehole_reference_elevation_type_id");

        migrationBuilder.RenameIndex(
            name: "IX_borehole_qt_reference_elevation_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            newName: "IX_borehole_precision_reference_elevation_id");

        migrationBuilder.RenameIndex(
            name: "IX_borehole_qt_location_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            newName: "IX_borehole_precision_location_id");

        migrationBuilder.RenameIndex(
            name: "IX_borehole_qt_elevation_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            newName: "IX_borehole_precision_elevation_id");

        migrationBuilder.RenameIndex(
            name: "IX_borehole_qt_length_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            newName: "IX_borehole_precision_depth_id");

        migrationBuilder.RenameIndex(
            name: "IX_borehole_purpose_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            newName: "IX_borehole_purpose_id");

        migrationBuilder.RenameIndex(
            name: "IX_borehole_locked_by_fkey",
            schema: "bdms",
            table: "borehole",
            newName: "IX_borehole_locked_by");

        migrationBuilder.RenameIndex(
            name: "IX_borehole_lithostrat_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            newName: "IX_borehole_lithostratigraphy_top_bedrock_id");

        migrationBuilder.RenameIndex(
            name: "IX_borehole_lithology_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            newName: "IX_borehole_lithology_top_bedrock_id");

        migrationBuilder.RenameIndex(
            name: "IX_borehole_id_wgp_fk_fkey",
            schema: "bdms",
            table: "borehole",
            newName: "IX_borehole_workgroup_id");

        migrationBuilder.RenameIndex(
            name: "IX_borehole_hrs_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            newName: "IX_borehole_hrs_id");

        migrationBuilder.RenameIndex(
            name: "IX_borehole_borehole_type_id_fkey",
            schema: "bdms",
            table: "borehole",
            newName: "IX_borehole_borehole_type_id");

        migrationBuilder.RenameIndex(
            name: "IX_borehole_chronostrat_id_cli_fkey",
            schema: "bdms",
            table: "borehole",
            newName: "IX_borehole_chronostratigraphy_top_bedrock_id");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_creator",
            schema: "bdms",
            table: "borehole",
            column: "creator");

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
            name: "FK_borehole_codelist_borehole_type_id",
            schema: "bdms",
            table: "borehole",
            column: "borehole_type_id",
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
            name: "FK_borehole_users_updater",
            schema: "bdms",
            table: "borehole",
            column: "updater",
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
}
