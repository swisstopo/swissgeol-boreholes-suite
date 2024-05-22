using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddMdAziDeviToGeometry : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<double>(
            name: "DEVI",
            schema: "bdms",
            table: "borehole_geometry",
            type: "double precision",
            nullable: true);

        migrationBuilder.AddColumn<double>(
            name: "HAZI",
            schema: "bdms",
            table: "borehole_geometry",
            type: "double precision",
            nullable: true);

        migrationBuilder.AddColumn<double>(
            name: "MD",
            schema: "bdms",
            table: "borehole_geometry",
            type: "double precision",
            nullable: false,
            defaultValue: 0.0);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "DEVI",
            schema: "bdms",
            table: "borehole_geometry");

        migrationBuilder.DropColumn(
            name: "HAZI",
            schema: "bdms",
            table: "borehole_geometry");

        migrationBuilder.DropColumn(
            name: "MD",
            schema: "bdms",
            table: "borehole_geometry");
    }
}
