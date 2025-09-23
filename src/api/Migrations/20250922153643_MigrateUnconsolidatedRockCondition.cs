using BDMS.Models;
using Humanizer;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class MigrateUnconsolidatedRockCondition : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            INSERT INTO bdms.lithology_rock_condition_codelist (lithology_id, rock_condition_id)
            SELECT v.lithology_id, v.rock_condition_id
            FROM (
                VALUES
                    (311623,100000168),
                    (299647,100000168),
                    (243592,100000168),
                    (304014,100000168),
                    (306106,100000168),
                    (243593,100000168),
                    (298641,100000168),
                    (306107,100000168),
                    (282841,100000168),
                    (215846,100000168),
                    (243587,100000168),
                    (243585,100000168),
                    (243595,100000168),
                    (243586,100000168)
            ) AS v(lithology_id, rock_condition_id)
            WHERE v.lithology_id IN(SELECT id FROM bdms.lithology);
        ");
    }
}
#pragma warning restore CA1505
