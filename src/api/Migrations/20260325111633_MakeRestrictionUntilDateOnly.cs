using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class MakeRestrictionUntilDateOnly : Migration
    {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Convert timestamp to date, handling timezone appropriately
        migrationBuilder.Sql(@"
        ALTER TABLE bdms.borehole 
        ALTER COLUMN restriction_until_bho 
        TYPE date 
        USING (restriction_until_bho AT TIME ZONE 'UTC')::date;
    ");
    }
}
