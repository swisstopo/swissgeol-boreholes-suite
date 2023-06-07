using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class RemoveUnusedDescriptionsFromLayer : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "facies_description_lay",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "lithological_description_lay",
            schema: "bdms",
            table: "layer");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
