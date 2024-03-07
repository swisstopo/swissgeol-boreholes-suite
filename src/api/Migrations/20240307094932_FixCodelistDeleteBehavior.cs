using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class FixCodelistDeleteBehavior : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_completion_codelist_kind_id",
            schema: "bdms",
            table: "completion");

        migrationBuilder.DropForeignKey(
            name: "FK_field_measurement_codelist_parameter",
            schema: "bdms",
            table: "field_measurement");

        migrationBuilder.DropForeignKey(
            name: "FK_field_measurement_codelist_sample_type",
            schema: "bdms",
            table: "field_measurement");

        migrationBuilder.DropForeignKey(
            name: "FK_groundwater_level_measurement_codelist_kind",
            schema: "bdms",
            table: "groundwater_level_measurement");

        migrationBuilder.DropForeignKey(
            name: "FK_hydrotest_result_codelist_parameter",
            schema: "bdms",
            table: "hydrotest_result");

        migrationBuilder.DropForeignKey(
            name: "FK_observation_codelist_reliability",
            schema: "bdms",
            table: "observation");

        migrationBuilder.DropForeignKey(
            name: "FK_water_ingress_codelist_quantity",
            schema: "bdms",
            table: "water_ingress");

        migrationBuilder.AddForeignKey(
            name: "FK_completion_codelist_kind_id",
            schema: "bdms",
            table: "completion",
            column: "kind_id",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli");

        migrationBuilder.AddForeignKey(
            name: "FK_field_measurement_codelist_parameter",
            schema: "bdms",
            table: "field_measurement",
            column: "parameter",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli");

        migrationBuilder.AddForeignKey(
            name: "FK_field_measurement_codelist_sample_type",
            schema: "bdms",
            table: "field_measurement",
            column: "sample_type",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli");

        migrationBuilder.AddForeignKey(
            name: "FK_groundwater_level_measurement_codelist_kind",
            schema: "bdms",
            table: "groundwater_level_measurement",
            column: "kind",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli");

        migrationBuilder.AddForeignKey(
            name: "FK_hydrotest_result_codelist_parameter",
            schema: "bdms",
            table: "hydrotest_result",
            column: "parameter",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli");

        migrationBuilder.AddForeignKey(
            name: "FK_observation_codelist_reliability",
            schema: "bdms",
            table: "observation",
            column: "reliability",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli");

        migrationBuilder.AddForeignKey(
            name: "FK_water_ingress_codelist_quantity",
            schema: "bdms",
            table: "water_ingress",
            column: "quantity",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_completion_codelist_kind_id",
            schema: "bdms",
            table: "completion");

        migrationBuilder.DropForeignKey(
            name: "FK_field_measurement_codelist_parameter",
            schema: "bdms",
            table: "field_measurement");

        migrationBuilder.DropForeignKey(
            name: "FK_field_measurement_codelist_sample_type",
            schema: "bdms",
            table: "field_measurement");

        migrationBuilder.DropForeignKey(
            name: "FK_groundwater_level_measurement_codelist_kind",
            schema: "bdms",
            table: "groundwater_level_measurement");

        migrationBuilder.DropForeignKey(
            name: "FK_hydrotest_result_codelist_parameter",
            schema: "bdms",
            table: "hydrotest_result");

        migrationBuilder.DropForeignKey(
            name: "FK_observation_codelist_reliability",
            schema: "bdms",
            table: "observation");

        migrationBuilder.DropForeignKey(
            name: "FK_water_ingress_codelist_quantity",
            schema: "bdms",
            table: "water_ingress");

        migrationBuilder.AddForeignKey(
            name: "FK_completion_codelist_kind_id",
            schema: "bdms",
            table: "completion",
            column: "kind_id",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_field_measurement_codelist_parameter",
            schema: "bdms",
            table: "field_measurement",
            column: "parameter",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_field_measurement_codelist_sample_type",
            schema: "bdms",
            table: "field_measurement",
            column: "sample_type",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_groundwater_level_measurement_codelist_kind",
            schema: "bdms",
            table: "groundwater_level_measurement",
            column: "kind",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_hydrotest_result_codelist_parameter",
            schema: "bdms",
            table: "hydrotest_result",
            column: "parameter",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_observation_codelist_reliability",
            schema: "bdms",
            table: "observation",
            column: "reliability",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_water_ingress_codelist_quantity",
            schema: "bdms",
            table: "water_ingress",
            column: "quantity",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);
    }
}
