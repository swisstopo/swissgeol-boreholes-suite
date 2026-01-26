using BDMS.Models;
using Humanizer;
using Microsoft.EntityFrameworkCore.Migrations;
using System.Collections.Generic;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class MigrateLithoChronostratigraphyCodes : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            UPDATE bdms.lithostratigraphy b
            SET lithostratigraphy_id = c2.id_cli
            FROM bdms.codelist c1
            JOIN bdms.codelist c2
                ON c1.geolcode = c2.geolcode
            WHERE b.lithostratigraphy_id = c1.id_cli
                AND c1.schema_cli = 'custom.lithostratigraphy_top_bedrock'
                AND c2.schema_cli = 'lithostratigraphy';

            UPDATE bdms.chronostratigraphy b
            SET chronostratigraphy_id = c2.id_cli
            FROM bdms.codelist c1
            JOIN bdms.codelist c2
                ON c1.geolcode = c2.geolcode
            WHERE b.chronostratigraphy_id = c1.id_cli
                AND c1.schema_cli = 'custom.chronostratigraphy_top_bedrock'
                AND c2.schema_cli = 'chronostratigraphy';
        ");
    }
}
#pragma warning restore CA1505
