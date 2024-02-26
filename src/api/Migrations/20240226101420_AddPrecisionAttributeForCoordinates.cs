using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations
{
    /// <inheritdoc />
    public partial class AddPrecisionAttributeForCoordinates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "precision_location_x",
                schema: "bdms",
                table: "borehole",
                type: "integer",
                nullable: true,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "precision_location_x_lv03",
                schema: "bdms",
                table: "borehole",
                type: "integer",
                nullable: true,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "precision_location_y",
                schema: "bdms",
                table: "borehole",
                type: "integer",
                nullable: true,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "precision_location_y_lv03",
                schema: "bdms",
                table: "borehole",
                type: "integer",
                nullable: true,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "precision_location_x",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropColumn(
                name: "precision_location_x_lv03",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropColumn(
                name: "precision_location_y",
                schema: "bdms",
                table: "borehole");

            migrationBuilder.DropColumn(
                name: "precision_location_y_lv03",
                schema: "bdms",
                table: "borehole");
        }
    }
}
