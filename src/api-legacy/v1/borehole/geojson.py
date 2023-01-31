# -*- coding: utf-8 -*-
from bms.v1.action import Action


class ListGeojson(Action):

    async def execute(self, filter={}, user=None):

        permissions = None
        if user is not None:
            permissions = self.filterPermission(user)

        layer_where, layer_params, layer_joins = self.filterProfileLayers(filter)

        casing_where, casing_params, casing_joins = self.filterCasings(filter)

        backfill_where, backfill_params, backfill_joins = self.filterBackfill(
            filter)

        instrument_where, instrument_params, instrument_joins = self.filterInstrument(
            filter)

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

                    WHERE
                        kind_id_cli = 3000

                    {}
                ) as strt
                ON 
                    borehole.id_bho = strt.id_bho_fk
            """.format(
                joins_string, where_string
            )

        if len(casing_params) > 0:

            joins_string = "\n".join(casing_joins) if len(
                casing_joins) > 0 else ''
            
            where_string = (
                " AND {}".format(" AND ".join(casing_where))
                if len(casing_where) > 0
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

                    WHERE
                        kind_id_cli = 3002

                    {}
                ) as casing
                ON 
                    borehole.id_bho = casing.id_bho_fk
            """.format(
                joins_string, where_string
            )
        
        if len(backfill_params) > 0:

            joins_string = "\n".join(backfill_joins) if len(
                backfill_joins) > 0 else ''
            where_string = (
                " AND {}".format(" AND ".join(backfill_where))
                if len(backfill_where) > 0
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

                    WHERE
                        kind_id_cli = 3004

                    {}
                ) as backfill
                ON 
                    borehole.id_bho = backfill.id_bho_fk
            """.format(
                joins_string, where_string
            )

        if len(instrument_params) > 0:

            joins_string = "\n".join(instrument_joins) if len(
                instrument_joins) > 0 else ''
            where_string = (
                " AND {}".format(" AND ".join(instrument_where))
                if len(instrument_where) > 0
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

                    WHERE
                        kind_id_cli = 3003

                    {}
                ) as instrument
                ON 
                    borehole.id_bho = instrument.id_bho_fk
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
                                                    original_name_bho
                                                        as name
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
                                        kind_id_cli = kd.id_cli

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
        """ % (wr_strt, wr), *(layer_params + casing_params +
                   backfill_params + instrument_params + params))
        return {
            "data": self.decode(rec[0])
        }
