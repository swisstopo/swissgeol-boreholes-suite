using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddStratigraphyV2 : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "stratigraphy_v2",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                borehole_id = table.Column<int>(type: "integer", nullable: false),
                name = table.Column<string>(type: "text", nullable: false),
                date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                is_primary = table.Column<bool>(type: "boolean", nullable: false),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                updated_by_id = table.Column<int>(type: "integer", nullable: true),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                created_by_id = table.Column<int>(type: "integer", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_stratigraphy_v2", x => x.id);
                table.ForeignKey(
                    name: "FK_stratigraphy_v2_borehole_borehole_id",
                    column: x => x.borehole_id,
                    principalSchema: "bdms",
                    principalTable: "borehole",
                    principalColumn: "id_bho",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_stratigraphy_v2_users_created_by_id",
                    column: x => x.created_by_id,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
                table.ForeignKey(
                    name: "FK_stratigraphy_v2_users_updated_by_id",
                    column: x => x.updated_by_id,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateIndex(
            name: "IX_stratigraphy_v2_borehole_id",
            schema: "bdms",
            table: "stratigraphy_v2",
            column: "borehole_id");

        migrationBuilder.CreateIndex(
            name: "IX_stratigraphy_v2_created_by_id",
            schema: "bdms",
            table: "stratigraphy_v2",
            column: "created_by_id");

        migrationBuilder.CreateIndex(
            name: "IX_stratigraphy_v2_updated_by_id",
            schema: "bdms",
            table: "stratigraphy_v2",
            column: "updated_by_id");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "stratigraphy_v2",
            schema: "bdms");
    }
}
