using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class RemoveSchemaFromJoinTable : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "code_cli",
            schema: "bdms",
            table: "hydrotest_codelist");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "code_cli",
            schema: "bdms",
            table: "hydrotest_codelist",
            type: "text",
            nullable: false,
            defaultValue: "");
    }
}
