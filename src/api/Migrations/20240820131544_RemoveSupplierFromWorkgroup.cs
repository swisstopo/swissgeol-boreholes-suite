using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RemoveSupplierFromWorkgroup : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "supplier_wgp",
            schema: "bdms",
            table: "workgroups");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "supplier_wgp",
            schema: "bdms",
            table: "workgroups",
            type: "boolean",
            nullable: true);
    }
}
