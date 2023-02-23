using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class AddUniqueConstraintForPrimaryStratigraphy : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("CREATE UNIQUE INDEX stratigraphy_primary_unique on bdms.stratigraphy(id_bho_fk) WHERE primary_sty;");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
