using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class DataMigrationTopBedrockIntersected : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
                UPDATE bdms.borehole SET top_bedrock_intersected = true WHERE top_bedrock_fresh_md is not null OR top_bedrock_weathered_md is not null;
                UPDATE bdms.borehole SET top_bedrock_intersected = false WHERE lithology_top_bedrock_id_cli = 15104769;");
    }
}
#pragma warning restore CA1505
