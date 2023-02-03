using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class DropObsoleteGeodinFilesTable : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("DROP TABLE IF EXISTS bdms.geodin_files");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
