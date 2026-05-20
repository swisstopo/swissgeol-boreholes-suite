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
            name: "total_depth",
            schema: "bdms",
            table: "borehole",
            newName: "depth_total");

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

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.RenameColumn(
            name: "status_to",
            schema: "bdms",
            table: "workflow_change",
            newName: "to_status");

        migrationBuilder.RenameColumn(
            name: "status_from",
            schema: "bdms",
            table: "workflow_change",
            newName: "from_status");

        migrationBuilder.RenameColumn(
            name: "depth_to",
            schema: "bdms",
            table: "section_element",
            newName: "to_depth");

        migrationBuilder.RenameColumn(
            name: "depth_from",
            schema: "bdms",
            table: "section_element",
            newName: "from_depth");

        migrationBuilder.RenameColumn(
            name: "depth_to",
            schema: "bdms",
            table: "photo",
            newName: "to_depth");

        migrationBuilder.RenameColumn(
            name: "depth_from",
            schema: "bdms",
            table: "photo",
            newName: "from_depth");

        migrationBuilder.RenameColumn(
            name: "time_start",
            schema: "bdms",
            table: "observation",
            newName: "start_time");

        migrationBuilder.RenameColumn(
            name: "time_end",
            schema: "bdms",
            table: "observation",
            newName: "end_time");

        migrationBuilder.RenameColumn(
            name: "depth_to_masl",
            schema: "bdms",
            table: "observation",
            newName: "to_depth_masl");

        migrationBuilder.RenameColumn(
            name: "depth_to_m",
            schema: "bdms",
            table: "observation",
            newName: "to_depth_m");

        migrationBuilder.RenameColumn(
            name: "depth_from_masl",
            schema: "bdms",
            table: "observation",
            newName: "from_depth_masl");

        migrationBuilder.RenameColumn(
            name: "depth_from_m",
            schema: "bdms",
            table: "observation",
            newName: "from_depth_m");

        migrationBuilder.RenameColumn(
            name: "depth_to",
            schema: "bdms",
            table: "log_run",
            newName: "to_depth");

        migrationBuilder.RenameColumn(
            name: "depth_from",
            schema: "bdms",
            table: "log_run",
            newName: "from_depth");

        migrationBuilder.RenameColumn(
            name: "depth_to",
            schema: "bdms",
            table: "instrumentation",
            newName: "to_depth");

        migrationBuilder.RenameColumn(
            name: "depth_from",
            schema: "bdms",
            table: "instrumentation",
            newName: "from_depth");

        migrationBuilder.RenameColumn(
            name: "value_min",
            schema: "bdms",
            table: "hydrotest_result",
            newName: "min_value");

        migrationBuilder.RenameColumn(
            name: "value_max",
            schema: "bdms",
            table: "hydrotest_result",
            newName: "max_value");

        migrationBuilder.RenameColumn(
            name: "diameter_outer",
            schema: "bdms",
            table: "casing_element",
            newName: "outer_diameter");

        migrationBuilder.RenameColumn(
            name: "diameter_inner",
            schema: "bdms",
            table: "casing_element",
            newName: "inner_diameter");

        migrationBuilder.RenameColumn(
            name: "depth_to",
            schema: "bdms",
            table: "casing_element",
            newName: "to_depth");

        migrationBuilder.RenameColumn(
            name: "depth_from",
            schema: "bdms",
            table: "casing_element",
            newName: "from_depth");

        migrationBuilder.RenameColumn(
            name: "depth_total",
            schema: "bdms",
            table: "borehole",
            newName: "total_depth");

        migrationBuilder.RenameColumn(
            name: "depth_to",
            schema: "bdms",
            table: "backfill",
            newName: "to_depth");

        migrationBuilder.RenameColumn(
            name: "depth_from",
            schema: "bdms",
            table: "backfill",
            newName: "from_depth");
    }
}
