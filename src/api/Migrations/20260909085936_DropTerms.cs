using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class DropTerms : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "terms_accepted",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "terms",
            schema: "bdms");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "terms",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                creation = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                expired = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                draft = table.Column<bool>(type: "boolean", nullable: false),
                text_de = table.Column<string>(type: "text", nullable: true),
                text_en = table.Column<string>(type: "text", nullable: false),
                text_fr = table.Column<string>(type: "text", nullable: true),
                text_it = table.Column<string>(type: "text", nullable: true),
                text_ro = table.Column<string>(type: "text", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_terms", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "terms_accepted",
            schema: "bdms",
            columns: table => new
            {
                user_id = table.Column<int>(type: "integer", nullable: false),
                term_id = table.Column<int>(type: "integer", nullable: false),
                accepted = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_terms_accepted", x => new { x.user_id, x.term_id });
                table.ForeignKey(
                    name: "FK_terms_accepted_terms_term_id",
                    column: x => x.term_id,
                    principalSchema: "bdms",
                    principalTable: "terms",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_terms_accepted_users_user_id",
                    column: x => x.user_id,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_terms_accepted_term_id",
            schema: "bdms",
            table: "terms_accepted",
            column: "term_id");
    }
}
