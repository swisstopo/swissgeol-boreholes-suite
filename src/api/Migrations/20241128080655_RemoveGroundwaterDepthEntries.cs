using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RemoveGroundwaterDepthEntries : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            UPDATE bdms.observation
	            SET from_depth_m=NULL, to_depth_m=NULL, from_depth_masl=NULL, to_depth_masl=NULL
	            WHERE observation_type = 2;");
    }
}
