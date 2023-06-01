using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

public partial class AddLithostratigraphyTable : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "lithostratigraphy",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                stratigraphy_id = table.Column<int>(type: "integer", nullable: false),
                creator = table.Column<int>(type: "integer", nullable: true),
                creation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                updater = table.Column<int>(type: "integer", nullable: true),
                update = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                depth_from = table.Column<double>(type: "double precision", nullable: true),
                depth_to = table.Column<double>(type: "double precision", nullable: true),
                is_last = table.Column<bool>(type: "boolean", nullable: true),
                lithostratigraphy_id = table.Column<int>(type: "integer", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_lithostratigraphy", x => x.id);
                table.ForeignKey(
                    name: "FK_lithostratigraphy_codelist_lithostratigraphy_id",
                    column: x => x.lithostratigraphy_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithostratigraphy_stratigraphy_stratigraphy_id",
                    column: x => x.stratigraphy_id,
                    principalSchema: "bdms",
                    principalTable: "stratigraphy",
                    principalColumn: "id_sty",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_lithostratigraphy_users_creator",
                    column: x => x.creator,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
                table.ForeignKey(
                    name: "FK_lithostratigraphy_users_updater",
                    column: x => x.updater,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateIndex(
            name: "IX_lithostratigraphy_creator",
            schema: "bdms",
            table: "lithostratigraphy",
            column: "creator");

        migrationBuilder.CreateIndex(
            name: "IX_lithostratigraphy_lithostratigraphy_id",
            schema: "bdms",
            table: "lithostratigraphy",
            column: "lithostratigraphy_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithostratigraphy_stratigraphy_id",
            schema: "bdms",
            table: "lithostratigraphy",
            column: "stratigraphy_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithostratigraphy_updater",
            schema: "bdms",
            table: "lithostratigraphy",
            column: "updater");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "lithostratigraphy",
            schema: "bdms");
    }
}
