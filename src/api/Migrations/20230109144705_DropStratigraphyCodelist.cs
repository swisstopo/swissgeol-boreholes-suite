using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class DropStratigraphyCodelist : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"DROP TABLE IF EXISTS bdms.stratigraphy_codelist;");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
