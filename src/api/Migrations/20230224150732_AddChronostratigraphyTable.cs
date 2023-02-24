using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

public partial class AddChronostratigraphyTable : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "chronostratigraphy",
            schema: "bdms",
            columns: table => new
            {
                id_chr = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                id_sty_fk = table.Column<int>(type: "integer", nullable: false),
                creator = table.Column<int>(type: "integer", nullable: true),
                creation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                updater = table.Column<int>(type: "integer", nullable: true),
                update = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                depth_from = table.Column<double>(type: "double precision", nullable: true),
                depth_to = table.Column<double>(type: "double precision", nullable: true),
                is_last = table.Column<bool>(type: "boolean", nullable: true),
                chronostratigraphy_id = table.Column<int>(type: "integer", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_chronostratigraphy", x => x.id_chr);
                table.ForeignKey(
                    name: "FK_chronostratigraphy_codelist_chronostratigraphy_id",
                    column: x => x.chronostratigraphy_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_chronostratigraphy_stratigraphy_id_sty_fk",
                    column: x => x.id_sty_fk,
                    principalSchema: "bdms",
                    principalTable: "stratigraphy",
                    principalColumn: "id_sty",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_chronostratigraphy_users_creator",
                    column: x => x.creator,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
                table.ForeignKey(
                    name: "FK_chronostratigraphy_users_updater",
                    column: x => x.updater,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateIndex(
            name: "IX_chronostratigraphy_chronostratigraphy_id",
            schema: "bdms",
            table: "chronostratigraphy",
            column: "chronostratigraphy_id");

        migrationBuilder.CreateIndex(
            name: "IX_chronostratigraphy_creator",
            schema: "bdms",
            table: "chronostratigraphy",
            column: "creator");

        migrationBuilder.CreateIndex(
            name: "IX_chronostratigraphy_id_sty_fk",
            schema: "bdms",
            table: "chronostratigraphy",
            column: "id_sty_fk");

        migrationBuilder.CreateIndex(
            name: "IX_chronostratigraphy_updater",
            schema: "bdms",
            table: "chronostratigraphy",
            column: "updater");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "chronostratigraphy",
            schema: "bdms");
    }
}
