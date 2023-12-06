using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AlterQtTopBedrock : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "borehole_qt_top_bedrock_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropForeignKey(
            name: "borehole_qt_top_bedrock_tvd_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropIndex(
            name: "IX_borehole_qt_top_bedrock_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropIndex(
            name: "IX_borehole_qt_top_bedrock_tvd_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.AddColumn<double>(
            name: "qt_top_bedrock",
            schema: "bdms",
            table: "borehole",
            type: "double precision",
            nullable: true);

        migrationBuilder.AddColumn<double>(
            name: "qt_top_bedrock_tvd",
            schema: "bdms",
            table: "borehole",
            type: "double precision",
            nullable: true);

        migrationBuilder.Sql(@"
            UPDATE bdms.borehole 
            SET qt_top_bedrock = CASE
                WHEN qt_top_bedrock_id_cli = 22108001 THEN 2.0
                WHEN qt_top_bedrock_id_cli = 22108002 THEN 1.0
                WHEN qt_top_bedrock_id_cli = 22108003 THEN 0.5
                WHEN qt_top_bedrock_id_cli = 22108004 THEN 0.1
                ELSE NULL
            END;
            ");

        migrationBuilder.Sql(@"
            UPDATE bdms.borehole 
            SET qt_top_bedrock_tvd = CASE
                WHEN qt_top_bedrock_tvd_id_cli = 22108001 THEN 2.0
                WHEN qt_top_bedrock_tvd_id_cli = 22108002 THEN 1.0
                WHEN qt_top_bedrock_tvd_id_cli = 22108003 THEN 0.5
                WHEN qt_top_bedrock_tvd_id_cli = 22108004 THEN 0.1
                ELSE NULL
            END;
            ");

        migrationBuilder.DropColumn(
            name: "qt_top_bedrock_id_cli",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropColumn(
            name: "qt_top_bedrock_tvd_id_cli",
            schema: "bdms",
            table: "borehole");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
