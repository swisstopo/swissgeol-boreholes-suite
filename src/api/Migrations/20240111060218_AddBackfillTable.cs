using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddBackfillTable : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "backfill",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                completion_id = table.Column<int>(type: "integer", nullable: false),
                from_depth = table.Column<double>(type: "double precision", nullable: true),
                to_depth = table.Column<double>(type: "double precision", nullable: true),
                kind_id = table.Column<int>(type: "integer", nullable: true),
                material_id = table.Column<int>(type: "integer", nullable: true),
                notes = table.Column<string>(type: "text", nullable: true),
                creator = table.Column<int>(type: "integer", nullable: true),
                creation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                updater = table.Column<int>(type: "integer", nullable: true),
                update = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_backfill", x => x.id);
                table.ForeignKey(
                    name: "FK_backfill_codelist_kind_id",
                    column: x => x.kind_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_backfill_codelist_material_id",
                    column: x => x.material_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_backfill_completion_completion_id",
                    column: x => x.completion_id,
                    principalSchema: "bdms",
                    principalTable: "completion",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_backfill_users_creator",
                    column: x => x.creator,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
                table.ForeignKey(
                    name: "FK_backfill_users_updater",
                    column: x => x.updater,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateIndex(
            name: "IX_backfill_completion_id",
            schema: "bdms",
            table: "backfill",
            column: "completion_id");

        migrationBuilder.CreateIndex(
            name: "IX_backfill_creator",
            schema: "bdms",
            table: "backfill",
            column: "creator");

        migrationBuilder.CreateIndex(
            name: "IX_backfill_kind_id",
            schema: "bdms",
            table: "backfill",
            column: "kind_id");

        migrationBuilder.CreateIndex(
            name: "IX_backfill_material_id",
            schema: "bdms",
            table: "backfill",
            column: "material_id");

        migrationBuilder.CreateIndex(
            name: "IX_backfill_updater",
            schema: "bdms",
            table: "backfill",
            column: "updater");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "backfill",
            schema: "bdms");
    }
}
