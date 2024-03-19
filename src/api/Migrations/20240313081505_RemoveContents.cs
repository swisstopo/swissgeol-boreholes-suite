using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RemoveContents : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "contents",
            schema: "bdms");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "contents",
            schema: "bdms",
            columns: table => new
            {
                id_cnt = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                creation_cnt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                expired_cnt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                draft_cnt = table.Column<bool>(type: "boolean", nullable: true),
                name_cnt = table.Column<string>(type: "text", nullable: false),
                text_cnt_de = table.Column<string>(type: "text", nullable: true),
                text_cnt_en = table.Column<string>(type: "text", nullable: true),
                text_cnt_fr = table.Column<string>(type: "text", nullable: true),
                text_cnt_it = table.Column<string>(type: "text", nullable: true),
                text_cnt_ro = table.Column<string>(type: "text", nullable: true),
                title_cnt_ro = table.Column<string>(type: "text", nullable: true),
                title_cnt_de = table.Column<string>(type: "text", nullable: true),
                title_cnt_en = table.Column<string>(type: "text", nullable: true),
                title_cnt_fr = table.Column<string>(type: "text", nullable: true),
                title_cnt_it = table.Column<string>(type: "text", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_contents", x => x.id_cnt);
            });
    }
}
