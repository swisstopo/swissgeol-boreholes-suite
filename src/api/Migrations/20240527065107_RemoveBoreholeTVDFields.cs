using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RemoveBoreholeTVDFields : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_borehole_codelist_qt_total_depth_tvd_id_cli",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropIndex(
            name: "IX_borehole_qt_total_depth_tvd_id_cli",
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

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<double>(
            name: "qt_top_bedrock_tvd",
            schema: "bdms",
            table: "borehole",
            type: "double precision",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "qt_total_depth_tvd_id_cli",
            schema: "bdms",
            table: "borehole",
            type: "integer",
            nullable: true);

        migrationBuilder.AddColumn<double>(
            name: "top_bedrock_tvd_bho",
            schema: "bdms",
            table: "borehole",
            type: "double precision",
            nullable: true);

        migrationBuilder.AddColumn<double>(
            name: "total_depth_tvd_bho",
            schema: "bdms",
            table: "borehole",
            type: "double precision",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_borehole_qt_total_depth_tvd_id_cli",
            schema: "bdms",
            table: "borehole",
            column: "qt_total_depth_tvd_id_cli");

        migrationBuilder.AddForeignKey(
            name: "FK_borehole_codelist_qt_total_depth_tvd_id_cli",
            schema: "bdms",
            table: "borehole",
            column: "qt_total_depth_tvd_id_cli",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli");
    }
}
