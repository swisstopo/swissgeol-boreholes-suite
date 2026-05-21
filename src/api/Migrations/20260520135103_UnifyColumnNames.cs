using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class UnifyColumnNames : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.RenameColumn(
            name: "to_status",
            schema: "bdms",
            table: "workflow_change",
            newName: "status_to");

        migrationBuilder.RenameColumn(
            name: "from_status",
            schema: "bdms",
            table: "workflow_change",
            newName: "status_from");

        migrationBuilder.RenameColumn(
            name: "to_depth",
            schema: "bdms",
            table: "section_element",
            newName: "depth_to");

        migrationBuilder.RenameColumn(
            name: "from_depth",
            schema: "bdms",
            table: "section_element",
            newName: "depth_from");

        migrationBuilder.RenameColumn(
            name: "to_depth",
            schema: "bdms",
            table: "photo",
            newName: "depth_to");

        migrationBuilder.RenameColumn(
            name: "from_depth",
            schema: "bdms",
            table: "photo",
            newName: "depth_from");

        migrationBuilder.RenameColumn(
            name: "to_depth_masl",
            schema: "bdms",
            table: "observation",
            newName: "depth_to_masl");

        migrationBuilder.RenameColumn(
            name: "to_depth_m",
            schema: "bdms",
            table: "observation",
            newName: "depth_to_m");

        migrationBuilder.RenameColumn(
            name: "start_time",
            schema: "bdms",
            table: "observation",
            newName: "time_start");

        migrationBuilder.RenameColumn(
            name: "from_depth_masl",
            schema: "bdms",
            table: "observation",
            newName: "depth_from_masl");

        migrationBuilder.RenameColumn(
            name: "from_depth_m",
            schema: "bdms",
            table: "observation",
            newName: "depth_from_m");

        migrationBuilder.RenameColumn(
            name: "end_time",
            schema: "bdms",
            table: "observation",
            newName: "time_end");

        migrationBuilder.RenameColumn(
            name: "to_depth",
            schema: "bdms",
            table: "log_run",
            newName: "depth_to");

        migrationBuilder.RenameColumn(
            name: "from_depth",
            schema: "bdms",
            table: "log_run",
            newName: "depth_from");

        migrationBuilder.RenameColumn(
            name: "to_depth",
            schema: "bdms",
            table: "instrumentation",
            newName: "depth_to");

        migrationBuilder.RenameColumn(
            name: "from_depth",
            schema: "bdms",
            table: "instrumentation",
            newName: "depth_from");

        migrationBuilder.RenameColumn(
            name: "min_value",
            schema: "bdms",
            table: "hydrotest_result",
            newName: "value_min");

        migrationBuilder.RenameColumn(
            name: "max_value",
            schema: "bdms",
            table: "hydrotest_result",
            newName: "value_max");

        migrationBuilder.RenameColumn(
            name: "to_depth",
            schema: "bdms",
            table: "casing_element",
            newName: "depth_to");

        migrationBuilder.RenameColumn(
            name: "outer_diameter",
            schema: "bdms",
            table: "casing_element",
            newName: "diameter_outer");

        migrationBuilder.RenameColumn(
            name: "inner_diameter",
            schema: "bdms",
            table: "casing_element",
            newName: "diameter_inner");

        migrationBuilder.RenameColumn(
            name: "from_depth",
            schema: "bdms",
            table: "casing_element",
            newName: "depth_from");

        migrationBuilder.RenameColumn(
            name: "to_depth",
            schema: "bdms",
            table: "backfill",
            newName: "depth_to");

        migrationBuilder.RenameColumn(
            name: "from_depth",
            schema: "bdms",
            table: "backfill",
            newName: "depth_from");
    }
}
