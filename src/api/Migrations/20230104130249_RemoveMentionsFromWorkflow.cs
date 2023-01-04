using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class RemoveMentionsFromWorkflow : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "mentions_wkf",
            schema: "bdms",
            table: "workflow");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string[]>(
            name: "mentions_wkf",
            schema: "bdms",
            table: "workflow",
            type: "text[]",
            nullable: true);
    }
}
