using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class SetStratigraphySequence : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            SELECT setval('bdms.stratigraphy_v2_id_seq', (SELECT MAX(id) FROM bdms.stratigraphy_v2));
            SELECT setval('bdms.lithology_id_seq', (SELECT MAX(id) FROM bdms.lithology));
        ");
    }
}
#pragma warning restore CA1505
