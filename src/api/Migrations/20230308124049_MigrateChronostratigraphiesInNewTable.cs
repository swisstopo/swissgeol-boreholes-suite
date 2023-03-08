using BDMS.Models;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class MigrateChronostratigraphiesInNewTable : Migration
{
    /// <summary>
    /// Migrate Chronostratigraphy "Middle Jurassic undifferenciated" to "Middle Jurassic".
    /// </summary>
    /// <remarks>
    /// The same migration as <see cref="MigrateChronostratigraphies"/> but for the new <see cref="ChronostratigraphyLayer"/>.
    /// </remarks>
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
UPDATE bdms.chronostratigraphy
SET chronostratigraphy_id = 15001070
WHERE chronostratigraphy_id = 15001168;
");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
