using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

#pragma warning disable CA1505

/// <inheritdoc />
public partial class RemoveBoreholeTVDFields : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "borehole_qt_total_depth_tvd_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropIndex(
            name: "IX_borehole_qt_total_depth_tvd_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropColumn(
            name: "qt_top_bedrock_tvd",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropColumn(
            name: "qt_total_depth_tvd_id_cli",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropColumn(
            name: "top_bedrock_tvd_bho",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropColumn(
            name: "total_depth_tvd_bho",
            schema: "bdms",
            table: "borehole");
    }
}
#pragma warning restore CA1505
