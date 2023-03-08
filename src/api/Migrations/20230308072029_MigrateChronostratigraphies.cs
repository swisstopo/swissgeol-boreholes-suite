using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class MigrateChronostratigraphies : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Migrate Chronostratigraphy "Middle Jurassic undifferenciated" to "Middle Jurassic"
        migrationBuilder.Sql(@"
UPDATE bdms.layer
SET chronostratigraphy_id_cli = 15001070
WHERE chronostratigraphy_id_cli = 15001168;
");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
