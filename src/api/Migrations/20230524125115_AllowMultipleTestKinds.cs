using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class AllowMultipleTestKinds : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_hydrotest_codelist_testkind",
            schema: "bdms",
            table: "hydrotest");

        migrationBuilder.DropIndex(
            name: "IX_hydrotest_testkind",
            schema: "bdms",
            table: "hydrotest");

        migrationBuilder.DropColumn(
            name: "testkind",
            schema: "bdms",
            table: "hydrotest");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "testkind",
            schema: "bdms",
            table: "hydrotest",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.CreateIndex(
            name: "IX_hydrotest_testkind",
            schema: "bdms",
            table: "hydrotest",
            column: "testkind");

        migrationBuilder.AddForeignKey(
            name: "FK_hydrotest_codelist_testkind",
            schema: "bdms",
            table: "hydrotest",
            column: "testkind",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);
    }
}
