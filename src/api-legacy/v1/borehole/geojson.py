# -*- coding: utf-8 -*-
from bms.v1.action import Action


class ListGeojson(Action):

    async def execute(self, filter={}, user=None):

        permissions = None
        if user is not None:
            permissions = self.filterPermission(user)

        #  filtering by map extent is not relevant for the geoJson Map data and can lead to missing data points.
        filter['extent'] = None
        where, params = self.filterBorehole(filter)

        wr_strt = ''
        wr = ''


        if len(where) > 0:
            wr = """
                AND {}
            """.format(
                " AND ".join(where)
            )

        if permissions is not None:
            wr += """
                AND {}
            """.format(
                permissions
            )

        rec = await self.conn.fetchrow("""
            SELECT
                row_to_json(t)
                FROM (
                    SELECT
                        'FeatureCollection' AS "type",
                        (
                            SELECT row_to_json(c)
                            FROM (
                                SELECT
                                    'name' AS "type",
                                    (
                                        SELECT row_to_json(p)
                                        FROM (
                                            SELECT
                                                'EPSG:2056' AS "name"
                                        ) AS p
                                    ) AS properties
                            ) c
                        ) AS crs,
                        COALESCE(
                            (
                                SELECT array_agg(row_to_json(f))
                                FROM (
                                    SELECT
                                        id_bho as id,
                                        'Feature' AS "type",
                                        ST_AsGeoJSON(
                                            geom_bho
                                        )::json AS "geometry",
                                        (
                                            SELECT row_to_json(p)
                                            FROM (
                                                SELECT
                                                    kd.code_cli
                                                        as kind,
                                                    rs.code_cli
                                                        as restriction,
                                                    alternate_name_bho
                                                        as name,
                                                    id_bho
                                                        as id
                                            ) AS p
                                        ) AS properties

                                    FROM bdms.borehole

                                    LEFT JOIN
                                        bdms.codelist kd
                                    ON
                                        borehole_type_id = kd.id_cli

                                    LEFT JOIN
                                        bdms.codelist rs
                                    ON
                                        restriction_id_cli = rs.id_cli

                                    %s

                                    WHERE
                                        geom_bho IS NOT NULL
                                    AND
                                        geom_bho && ST_MakeEnvelope (
                                            2420000, 1030000,
                                            2900000, 1350000,
                                            2056
                                    )
                                    %s
                                ) f
                            ), '{}'::json[]
                        ) AS features
                ) t
        """ % (wr_strt, wr), *(params))
        return {
            "data": self.decode(rec[0])
        }
