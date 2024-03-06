using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations
{
    /// <inheritdoc />
    public partial class RemoveIsLastAttributes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_last",
                schema: "bdms",
                table: "lithostratigraphy");

            migrationBuilder.DropColumn(
                name: "is_last",
                schema: "bdms",
                table: "lithological_description");

            migrationBuilder.DropColumn(
                name: "is_last",
                schema: "bdms",
                table: "facies_description");

            migrationBuilder.DropColumn(
                name: "is_last",
                schema: "bdms",
                table: "chronostratigraphy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_last",
                schema: "bdms",
                table: "lithostratigraphy",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_last",
                schema: "bdms",
                table: "lithological_description",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_last",
                schema: "bdms",
                table: "facies_description",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_last",
                schema: "bdms",
                table: "chronostratigraphy",
                type: "boolean",
                nullable: true);
        }
    }
}
