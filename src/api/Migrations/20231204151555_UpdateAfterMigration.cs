using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class UpdateAfterMigration : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterDatabase()
            .Annotation("Npgsql:PostgresExtension:ltree", ",,")
            .Annotation("Npgsql:PostgresExtension:postgis", ",,");

        migrationBuilder.AlterColumn<int>(
            name: "id_rol_fk",
            schema: "bdms",
            table: "workflow",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "int",
            oldNullable: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
