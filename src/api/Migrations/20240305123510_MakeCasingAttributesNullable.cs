using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class MakeCasingAttributesNullable : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<double>(
            name: "outer_diameter",
            schema: "bdms",
            table: "casing_element",
            type: "double precision",
            nullable: true,
            oldClrType: typeof(double),
            oldType: "double precision");

        migrationBuilder.AlterColumn<int>(
            name: "material_id",
            schema: "bdms",
            table: "casing_element",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AlterColumn<double>(
            name: "inner_diameter",
            schema: "bdms",
            table: "casing_element",
            type: "double precision",
            nullable: true,
            oldClrType: typeof(double),
            oldType: "double precision");

        migrationBuilder.AlterColumn<DateOnly>(
            name: "date_start",
            schema: "bdms",
            table: "casing",
            type: "date",
            nullable: true,
            oldClrType: typeof(DateOnly),
            oldType: "date");

        migrationBuilder.AlterColumn<DateOnly>(
            name: "date_finish",
            schema: "bdms",
            table: "casing",
            type: "date",
            nullable: true,
            oldClrType: typeof(DateOnly),
            oldType: "date");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
