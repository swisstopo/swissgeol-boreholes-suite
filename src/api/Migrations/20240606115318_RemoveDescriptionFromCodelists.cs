using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDescriptionFromCodelists : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "description_cli_de",
                schema: "bdms",
                table: "codelist");

            migrationBuilder.DropColumn(
                name: "description_cli_en",
                schema: "bdms",
                table: "codelist");

            migrationBuilder.DropColumn(
                name: "description_cli_fr",
                schema: "bdms",
                table: "codelist");

            migrationBuilder.DropColumn(
                name: "description_cli_it",
                schema: "bdms",
                table: "codelist");

            migrationBuilder.DropColumn(
                name: "description_cli_ro",
                schema: "bdms",
                table: "codelist");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "description_cli_de",
                schema: "bdms",
                table: "codelist",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "description_cli_en",
                schema: "bdms",
                table: "codelist",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "description_cli_fr",
                schema: "bdms",
                table: "codelist",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "description_cli_it",
                schema: "bdms",
                table: "codelist",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "description_cli_ro",
                schema: "bdms",
                table: "codelist",
                type: "text",
                nullable: true);
        }
    }
}
