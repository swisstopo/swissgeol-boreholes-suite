using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations
{
    /// <inheritdoc />
    public partial class AddIsOpenBoreholeToObservation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_open_borehole",
                schema: "bdms",
                table: "observation",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_open_borehole",
                schema: "bdms",
                table: "observation");
        }
    }
}
