using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddBoreholeGeometryTable : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "borehole_geometry",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                borehole_id = table.Column<int>(type: "integer", nullable: false),
                X = table.Column<double>(type: "double precision", nullable: false),
                Y = table.Column<double>(type: "double precision", nullable: false),
                Z = table.Column<double>(type: "double precision", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_borehole_geometry", x => x.id);
                table.ForeignKey(
                    name: "FK_borehole_geometry_borehole_borehole_id",
                    column: x => x.borehole_id,
                    principalSchema: "bdms",
                    principalTable: "borehole",
                    principalColumn: "id_bho",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_borehole_geometry_borehole_id",
            schema: "bdms",
            table: "borehole_geometry",
            column: "borehole_id");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "borehole_geometry",
            schema: "bdms");
    }
}
