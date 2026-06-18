using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class SetStratigraphyNameRequired : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Assign sequential names to stratigraphies with an empty name.
        // Per borehole, numbering continues after the highest existing
        // ""Stratigraphie N"" number, so it never collides with an already-used
        // number and the unique(borehole_id, name) constraint holds.
        migrationBuilder.Sql(@"
            UPDATE bdms.stratigraphy AS s
            SET name = 'Stratigraphie ' || (existing.max_n + numbered.rn)
            FROM (
                SELECT
                    id,
                    borehole_id,
                    ROW_NUMBER() OVER (PARTITION BY borehole_id ORDER BY id) AS rn
                FROM bdms.stratigraphy
                WHERE name IS NULL OR btrim(name) = ''
            ) AS numbered
            JOIN LATERAL (
                SELECT COALESCE(MAX(CAST(substring(e.name FROM '^Stratigraphie (\d+)$') AS integer)), 0) AS max_n
                FROM bdms.stratigraphy e
                WHERE e.borehole_id = numbered.borehole_id
                  AND e.name ~ '^Stratigraphie \d+$'
            ) AS existing ON true
            WHERE s.id = numbered.id;
        ");

        migrationBuilder.AlterColumn<string>(
            name: "name",
            schema: "bdms",
            table: "stratigraphy",
            type: "text",
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "text",
            oldNullable: true);
    }
}
