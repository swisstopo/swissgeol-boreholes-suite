using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddCompletionTable : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "completion",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                borehole_id = table.Column<int>(type: "integer", nullable: false),
                is_primary = table.Column<bool>(type: "boolean", nullable: false),
                name = table.Column<string>(type: "text", nullable: true),
                kind_id = table.Column<int>(type: "integer", nullable: false),
                notes = table.Column<string>(type: "text", nullable: true),
                abandon_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                creator = table.Column<int>(type: "integer", nullable: true),
                creation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                updater = table.Column<int>(type: "integer", nullable: true),
                update = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_completion", x => x.id);
                table.ForeignKey(
                    name: "FK_completion_borehole_borehole_id",
                    column: x => x.borehole_id,
                    principalSchema: "bdms",
                    principalTable: "borehole",
                    principalColumn: "id_bho",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_completion_codelist_kind_id",
                    column: x => x.kind_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_completion_users_creator",
                    column: x => x.creator,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
                table.ForeignKey(
                    name: "FK_completion_users_updater",
                    column: x => x.updater,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateIndex(
            name: "IX_completion_borehole_id",
            schema: "bdms",
            table: "completion",
            column: "borehole_id");

        migrationBuilder.CreateIndex(
            name: "IX_completion_creator",
            schema: "bdms",
            table: "completion",
            column: "creator");

        migrationBuilder.CreateIndex(
            name: "IX_completion_kind_id",
            schema: "bdms",
            table: "completion",
            column: "kind_id");

        migrationBuilder.CreateIndex(
            name: "IX_completion_updater",
            schema: "bdms",
            table: "completion",
            column: "updater");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "completion",
            schema: "bdms");
    }
}
