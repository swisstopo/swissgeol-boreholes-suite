using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class SetFaciesQtDescriptionNull : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Set quality of description of Facies Description to NULL
        migrationBuilder.Sql("UPDATE bdms.facies_description SET qt_description_id = NULL;");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
