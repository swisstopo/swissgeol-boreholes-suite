using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class RemoveObsoleteDateFromBorehole : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn("date_bho", "borehole", "bdms");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
