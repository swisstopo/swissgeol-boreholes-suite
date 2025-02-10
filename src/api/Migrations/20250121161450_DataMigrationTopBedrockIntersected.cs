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
                UPDATE bdms.borehole SET top_bedrock_intersected = NULL;
				UPDATE bdms.borehole SET top_bedrock_intersected = true WHERE top_bedrock_fresh_md is not null OR top_bedrock_weathered_md is not null;
                UPDATE bdms.borehole b
                    SET top_bedrock_intersected = 'false'
                    FROM (
                        SELECT
                            s.id_bho_fk
                        FROM
                            bdms.layer l
                        INNER JOIN bdms.stratigraphy s ON l.id_sty_fk = s.id_sty
                        INNER JOIN (
                            SELECT
                                l.id_sty_fk,
                                MAX(l.depth_to_lay) AS max_depth
                            FROM
                                bdms.layer l
                            GROUP BY
                                l.id_sty_fk
                        ) max_l ON l.id_sty_fk = max_l.id_sty_fk AND l.depth_to_lay = max_l.max_depth
                        WHERE
                            s.primary_sty = TRUE AND
                            (l.lithology_id_cli = 15104769)
                        GROUP BY
                            s.id_bho_fk
                    ) as subquery
                    WHERE b.id_bho = subquery.id_bho_fk;

                UPDATE bdms.borehole b
                    SET top_bedrock_intersected = 'true'
                    FROM (
                        SELECT
                            s.id_bho_fk
                        FROM
                            bdms.layer l
                        INNER JOIN bdms.stratigraphy s ON l.id_sty_fk = s.id_sty
                        INNER JOIN (
                            SELECT
                                l.id_sty_fk,
                                MAX(l.depth_to_lay) AS max_depth
                            FROM
                                bdms.layer l
                            GROUP BY
                                l.id_sty_fk
                        ) max_l ON l.id_sty_fk = max_l.id_sty_fk AND l.depth_to_lay = max_l.max_depth
                        WHERE
                            s.primary_sty = TRUE AND
                            (l.uscs_1_id_cli = 23101033)
                        GROUP BY
                            s.id_bho_fk
                    ) as subquery
                    WHERE b.id_bho = subquery.id_bho_fk;");
    }
}
#pragma warning restore CA1505
