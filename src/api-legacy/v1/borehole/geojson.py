# -*- coding: utf-8 -*-
from bms.v1.action import Action


class ListGeojson(Action):

    async def execute(self, filter={}, user=None):

        permissions = None
        if user is not None:
            permissions = self.filterPermission(user)

        layer_where, layer_params, layer_joins = self.filterProfileLayers(filter)

        chronostratigraphy_where, chronostratigraphy_params, chronostratigraphy_joins = self.filterChronostratigraphy(filter)

        lithostratigraphy_where, lithostratigraphy_params, lithostratigraphy_joins = self.filterLithostratigraphy(filter)

        #  filtering by map extent is not relevant for the geoJson Map data and can lead to missing data points.
        filter['extent'] = None
        where, params = self.filterBorehole(filter)

        wr_strt = ''
        wr = ''

        if len(layer_params) > 0:

            joins_string = "\n".join(layer_joins) if len(layer_joins)>0 else ''

            where_string = (
                "AND {}".format(" AND ".join(layer_where))
                if len(layer_where) > 0
                else ''
            )

            wr_strt += """
                INNER JOIN (
                    SELECT DISTINCT
                        id_bho_fk

                    FROM
                        bdms.stratigraphy

                    INNER JOIN
                        bdms.layer
                    ON
                        id_sty_fk = id_sty

                    {}

                    {}

                ) as strt
                ON
                    borehole.id_bho = strt.id_bho_fk
            """.format(
                joins_string, where_string
            )

        if len(chronostratigraphy_params) > 0:

            joins_string = "\n".join(chronostratigraphy_joins) if len(
                chronostratigraphy_joins) > 0 else ''
            where_string = (
                "AND {}".format(" AND ".join(chronostratigraphy_where))
                if len(chronostratigraphy_where) > 0
                else ''
            )

            wr_strt += """
                INNER JOIN (
                    SELECT DISTINCT
                        id_bho_fk

                    FROM
                        bdms.stratigraphy

                    INNER JOIN
                        bdms.chronostratigraphy
                    ON
                        id_sty_fk = id_sty
                    {}

                    {}

                ) as chronostratigraphy
                ON
                    borehole.id_bho = chronostratigraphy.id_bho_fk
            """.format(
                joins_string, where_string
            )

        if len(lithostratigraphy_params) > 0:

            joins_string = "\n".join(lithostratigraphy_joins) if len(
                lithostratigraphy_joins) > 0 else ''
            where_string = (
                "AND {}".format(" AND ".join(lithostratigraphy_where))
                if len(lithostratigraphy_where) > 0
                else ''
            )

            wr_strt += """
                INNER JOIN (
                    SELECT DISTINCT
                        id_bho_fk

                    FROM
                        bdms.stratigraphy

                    INNER JOIN
                        bdms.lithostratigraphy
                    ON
                        stratigraphy_id = id_sty
                    {}

                    {}

                ) as lithostratigraphy
                ON
                    borehole.id_bho = lithostratigraphy.id_bho_fk
            """.format(
                joins_string, where_string
            )

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

                                    INNER JOIN (
                                        SELECT
                                            id_bho_fk,
                                            array_agg(
                                                json_build_object(
                                                    'workflow', id_wkf,
                                                    'role', name_rol,
                                                    'username', username,
                                                    'started', started,
                                                    'finished', finished
                                                )
                                            ) as status
                                        FROM (
                                            SELECT
                                                id_bho_fk,
                                                name_rol,
                                                id_wkf,
                                                username,
                                                started_wkf as started,
                                                finished_wkf as finished
                                            FROM
                                                bdms.workflow,
                                                bdms.roles,
                                                bdms.users
                                            WHERE
                                                id_rol = id_rol_fk
                                            AND
                                                id_usr = id_usr_fk
                                            ORDER BY
                                                id_bho_fk asc, id_wkf asc
                                        ) t
                                        GROUP BY
                                            id_bho_fk
                                    ) as v
                                    ON
                                        v.id_bho_fk = id_bho

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
        """ % (wr_strt, wr), *(layer_params + chronostratigraphy_params + lithostratigraphy_params + params))
        return {
            "data": self.decode(rec[0])
        }
