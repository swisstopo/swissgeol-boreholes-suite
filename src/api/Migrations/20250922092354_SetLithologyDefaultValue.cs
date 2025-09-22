using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class SetLithologyDefaultValue : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<bool>(
            name: "striae",
            schema: "bdms",
            table: "lithology_description",
            type: "boolean",
            nullable: false,
            defaultValue: false,
            oldClrType: typeof(bool),
            oldType: "boolean");

        migrationBuilder.AlterColumn<bool>(
            name: "first",
            schema: "bdms",
            table: "lithology_description",
            type: "boolean",
            nullable: false,
            defaultValue: true,
            oldClrType: typeof(bool),
            oldType: "boolean");

        migrationBuilder.AlterColumn<bool>(
            name: "bedding",
            schema: "bdms",
            table: "lithology",
            type: "boolean",
            nullable: false,
            defaultValue: false,
            oldClrType: typeof(bool),
            oldType: "boolean");
    }
}
#pragma warning restore CA1505
