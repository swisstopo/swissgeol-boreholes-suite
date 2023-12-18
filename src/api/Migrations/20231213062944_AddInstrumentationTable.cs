using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddInstrumentationTable : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "instrumentation",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                completion_id = table.Column<int>(type: "integer", nullable: false),
                from_depth = table.Column<double>(type: "double precision", nullable: true),
                to_depth = table.Column<double>(type: "double precision", nullable: true),
                name = table.Column<string>(type: "text", nullable: true),
                kind_id = table.Column<int>(type: "integer", nullable: true),
                status_id = table.Column<int>(type: "integer", nullable: true),
                notes = table.Column<string>(type: "text", nullable: true),
                creator = table.Column<int>(type: "integer", nullable: true),
                creation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                updater = table.Column<int>(type: "integer", nullable: true),
                update = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_instrumentation", x => x.id);
                table.ForeignKey(
                    name: "FK_instrumentation_codelist_kind_id",
                    column: x => x.kind_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_instrumentation_codelist_status_id",
                    column: x => x.status_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_instrumentation_completion_completion_id",
                    column: x => x.completion_id,
                    principalSchema: "bdms",
                    principalTable: "completion",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_instrumentation_users_creator",
                    column: x => x.creator,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
                table.ForeignKey(
                    name: "FK_instrumentation_users_updater",
                    column: x => x.updater,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateIndex(
            name: "IX_instrumentation_completion_id",
            schema: "bdms",
            table: "instrumentation",
            column: "completion_id");

        migrationBuilder.CreateIndex(
            name: "IX_instrumentation_creator",
            schema: "bdms",
            table: "instrumentation",
            column: "creator");

        migrationBuilder.CreateIndex(
            name: "IX_instrumentation_kind_id",
            schema: "bdms",
            table: "instrumentation",
            column: "kind_id");

        migrationBuilder.CreateIndex(
            name: "IX_instrumentation_status_id",
            schema: "bdms",
            table: "instrumentation",
            column: "status_id");

        migrationBuilder.CreateIndex(
            name: "IX_instrumentation_updater",
            schema: "bdms",
            table: "instrumentation",
            column: "updater");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "instrumentation",
            schema: "bdms");
    }
}
