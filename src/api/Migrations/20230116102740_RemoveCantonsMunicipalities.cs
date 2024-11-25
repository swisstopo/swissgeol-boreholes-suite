using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using System;

#nullable disable

namespace BDMS.Migrations;

public partial class RemoveCantonsMunicipalities : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "country_bho_tmp",
            schema: "bdms",
            table: "borehole",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "canton_bho_tmp",
            schema: "bdms",
            table: "borehole",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "municipality_bho_tmp",
            schema: "bdms",
            table: "borehole",
            type: "text",
            nullable: true);

        migrationBuilder.Sql(@"
                UPDATE bdms.borehole
                SET country_bho_tmp = 'Schweiz',
                    canton_bho_tmp = (SELECT name from bdms.cantons WHERE cantons.gid = canton_bho),
                    municipality_bho_tmp = (SELECT name from bdms.municipalities WHERE municipalities.gid = city_bho)
                ");

        // Remove Canton / City as measure of completeness.
        migrationBuilder.Sql("DROP VIEW bdms.completness");
        migrationBuilder.Sql(@"
            CREATE VIEW bdms.completness AS
             SELECT t.id_bho,
                row_to_json(t.*) AS detail,
                json_build_array(t.original_name, t.public_name, t.kind, t.restriction, t.restriction_until, t.location, t.srs, t.qt_location, t.elevation_z, t.qt_elevation, t.hrs) AS arr,
                (t.original_name AND t.public_name AND t.kind AND t.restriction AND t.restriction_until AND t.location AND t.srs AND t.qt_location AND t.elevation_z AND t.qt_elevation AND t.hrs) AS complete,
                round(((100.0 / 11.0) * ((((((((((
                    CASE
                        WHEN t.original_name THEN 1.0
                        ELSE 0.0
                    END +
                    CASE
                        WHEN t.public_name THEN 1.0
                        ELSE 0.0
                    END) +
                    CASE
                        WHEN t.kind THEN 1.0
                        ELSE 0.0
                    END) +
                    CASE
                        WHEN t.restriction THEN 1.0
                        ELSE 0.0
                    END) +
                    CASE
                        WHEN t.restriction_until THEN 1.0
                        ELSE 0.0
                    END) +
                    CASE
                        WHEN t.location THEN 1.0
                        ELSE 0.0
                    END) +
                    CASE
                        WHEN t.srs THEN 1.0
                        ELSE 0.0
                    END) +
                    CASE
                        WHEN t.qt_location THEN 1.0
                        ELSE 0.0
                    END) +
                    CASE
                        WHEN t.elevation_z THEN 1.0
                        ELSE 0.0
                    END) +
                    CASE
                        WHEN t.qt_elevation THEN 1.0
                        ELSE 0.0
                    END) +
                    CASE
                        WHEN t.hrs THEN 1.0
                        ELSE 0.0
                    END))) AS percentage
               FROM ( SELECT borehole.id_bho,
                        ((borehole.original_name_bho IS NOT NULL) AND ((borehole.original_name_bho)::text <> ''::text)) AS original_name,
                        ((borehole.alternate_name_bho IS NOT NULL) AND ((borehole.alternate_name_bho)::text <> ''::text)) AS public_name,
                        (borehole.kind_id_cli IS NOT NULL) AS kind,
                        (borehole.restriction_id_cli IS NOT NULL) AS restriction,
                        ((borehole.restriction_id_cli IS NOT NULL) AND ((((rcl.code_cli)::text = 'b'::text) AND (borehole.restriction_until_bho IS NOT NULL)) OR (((rcl.code_cli)::text <> 'b'::text) AND (borehole.restriction_until_bho IS NULL)))) AS restriction_until,
                        ((borehole.location_x_bho IS NOT NULL) AND (borehole.location_y_bho IS NOT NULL)) AS location,
                        (borehole.srs_id_cli IS NOT NULL) AS srs,
                        (borehole.qt_location_id_cli IS NOT NULL) AS qt_location,
                        (borehole.elevation_z_bho IS NOT NULL) AS elevation_z,
                        (borehole.qt_elevation_id_cli IS NOT NULL) AS qt_elevation,
                        (borehole.hrs_id_cli IS NOT NULL) AS hrs
                       FROM (bdms.borehole
                         LEFT JOIN bdms.codelist rcl ON ((borehole.restriction_id_cli = rcl.id_cli)))
                      ORDER BY borehole.id_bho) t;
");

        migrationBuilder.DropCheckConstraint(name: "borehole_canton_bho_fkey", table: "borehole", schema: "bdms");
        migrationBuilder.DropCheckConstraint(name: "borehole_city_bho_fkey", table: "borehole", schema: "bdms");

        migrationBuilder.DropColumn(name: "canton_bho", table: "borehole", schema: "bdms");
        migrationBuilder.DropColumn(name: "city_bho", table: "borehole", schema: "bdms");

        migrationBuilder.RenameColumn(name: "country_bho_tmp", table: "borehole", newName: "country_bho", schema: "bdms");
        migrationBuilder.RenameColumn(name: "canton_bho_tmp", table: "borehole", newName: "canton_bho", schema: "bdms");
        migrationBuilder.RenameColumn(name: "municipality_bho_tmp", table: "borehole", newName: "municipality_bho", schema: "bdms");

        migrationBuilder.DropTable(name: "cantons", schema: "bdms");
        migrationBuilder.DropTable(name: "municipalities", schema: "bdms");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
