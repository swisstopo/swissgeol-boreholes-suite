using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RemoveObsoleteUserFields : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "password", schema: "bdms", table: "users");
        migrationBuilder.DropColumn(name: "middlename", schema: "bdms", table: "users");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "password",
            schema: "bdms",
            table: "users",
            type: "text",
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "middlename",
            schema: "bdms",
            table: "users",
            type: "text",
            nullable: true);
    }
}
