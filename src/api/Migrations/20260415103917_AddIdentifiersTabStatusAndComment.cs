using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddIdentifiersTabStatusAndComment : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "identifiers",
            schema: "bdms",
            table: "tab_status",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<string>(
            name: "comment",
            schema: "bdms",
            table: "borehole_identifiers_codelist",
            type: "text",
            nullable: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "identifiers",
            schema: "bdms",
            table: "tab_status");

        migrationBuilder.DropColumn(
            name: "comment",
            schema: "bdms",
            table: "borehole_identifiers_codelist");
    }
}
