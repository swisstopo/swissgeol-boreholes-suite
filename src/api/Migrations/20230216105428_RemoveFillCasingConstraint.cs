using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class RemoveFillCasingConstraint : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Drop this foreign key because the client application expects
        // to save zero (0) values in this column for the default dropdown item.
        migrationBuilder.DropForeignKey(
            name: "FK_stratigraphy_stratigraphy_fill_casng_id_sty_fk",
            schema: "bdms",
            table: "stratigraphy");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
