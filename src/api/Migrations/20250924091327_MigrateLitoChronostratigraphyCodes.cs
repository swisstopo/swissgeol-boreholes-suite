using BDMS.Models;
using Humanizer;
using Microsoft.EntityFrameworkCore.Migrations;
using System.Collections.Generic;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class MigrateLitoChronostratigraphyCodes : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            UPDATE bdms.lithostratigraphy b
            SET lithostratigraphy_id = (
                SELECT c2.id_cli
                FROM bdms.codelist c1
                JOIN bdms.codelist c2
                    ON c1.geolcode = c2.geolcode
                WHERE c1.id_cli = b.lithostratigraphy_id
                    AND c1.schema_cli = 'custom.lithostratigraphy_top_bedrock'
                    AND c2.schema_cli = 'lithostratigraphy'
            )
            WHERE EXISTS(
                SELECT 1
                FROM bdms.codelist c1
                WHERE c1.id_cli = b.lithostratigraphy_id
                    AND c1.schema_cli = 'custom.lithostratigraphy_top_bedrock'
            );

            UPDATE bdms.chronostratigraphy b
            SET chronostratigraphy_id = (
                SELECT c2.id_cli
                FROM bdms.codelist c1
                JOIN bdms.codelist c2
                    ON c1.geolcode = c2.geolcode
                WHERE c1.id_cli = b.chronostratigraphy_id
                    AND c1.schema_cli = 'custom.chronostratigraphy_top_bedrock'
                    AND c2.schema_cli = 'chronostratigraphy'
            )
            WHERE EXISTS(
                SELECT 1
                FROM bdms.codelist c1
                WHERE c1.id_cli = b.chronostratigraphy_id
                    AND c1.schema_cli = 'custom.chronostratigraphy_top_bedrock'
            );
        ");
    }
}
#pragma warning restore CA1505
