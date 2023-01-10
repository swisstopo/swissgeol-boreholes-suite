# -*- coding: utf-8 -*-
from bms.v1.action import Action
import math


class ListEditingBorehole(Action):

    async def execute(
        self, limit=None, page=None,
        filter={}, orderby=None, direction=None, user=None
    ):

        permissions = None
        if user is not None:
            # Exclude VIEW role to filter out published boreholes
            permissions = self.filterPermission(user, ['VIEW'])

        paging = ''

        layer_where, layer_params, layer_joins = self.filterProfileLayers(
            filter)

        casing_where, casing_params, casing_joins = self.filterCasings(filter)

        backfill_where, backfill_params, backfill_joins = self.filterBackfill(
            filter)

        instrument_where, instrument_params, instrument_joins = self.filterInstrument(
            filter)

        where, params = self.filterBorehole(filter)

        if limit is not None and page is not None:
            paging = """
                LIMIT %s
                OFFSET %s
            """ % (self.getIdx(), self.getIdx())
            params += [
                limit, (int(limit) * (int(page) - 1))
            ]

        rowsSql = f"""
            SELECT
                borehole.id_bho as id,
                borehole.public_bho as visible,
                (
                    SELECT row_to_json(t)
                    FROM (
                        SELECT
                            id_wgp as id,
                            name_wgp as name
                    ) t
                ) as workgroup,
                (
                    select row_to_json(t)
                    FROM (
                        SELECT
                            creator.id_usr as id,
                            creator.username as username,
                            to_char(
                                created_bho,
                                'YYYY-MM-DD"T"HH24:MI:SSOF'
                            ) as date
                    ) t
                ) as creator,
                CASE
                    WHEN (
                        borehole.locked_by_bho is NULL
                        OR (
                            borehole.locked_bho < NOW()
                                - INTERVAL '{self.lock_timeout} minutes'
                        )
                    ) THEN NULL
                    ELSE (
                        select row_to_json(t2)
                        FROM (
                            SELECT
                                borehole.locked_by_bho as id,
                                locker.username as username,
                                locker.firstname || ' ' || locker.lastname
                                    as fullname,
                                to_char(
                                    borehole.locked_bho,
                                    'YYYY-MM-DD"T"HH24:MI:SSOF'
                                ) as date
                        ) t2
                    )
                END AS lock,
                original_name_bho as original_name,
                kind_id_cli as kind,
                restriction_id_cli as restriction,
                to_char(
                    restriction_until_bho,
                    'YYYY-MM-DD'
                ) as restriction_until,
                location_x_bho as location_x,
                location_y_bho as location_y,
                location_x_lv03_bho as location_x_lv03,
                location_y_lv03_bho as location_y_lv03,
                srs_id_cli as srs,
                elevation_z_bho as elevation_z,
                hrs_id_cli as hrs,
                drilling_date_bho as drilling_date,
                spud_date_bho as spud_date,
                total_depth_bho as total_depth,
                (
                    select row_to_json(t)
                    FROM (
                        SELECT
                            status_id_cli as status
                    ) t
                ) as extended,
                stratigraphy as stratigraphy,
                completness.percentage,
                array_to_json(status) as workflows,
                status[array_length(status, 1)]  ->> 'role' as "role"

            FROM
                bdms.borehole

            LEFT JOIN (
                SELECT
                    id_bho_fk,
                    array_agg(id_cli_fk) as borehole_identifier,
                    array_agg(value_bco) as identifier_value
                FROM
                    bdms.borehole_codelist
                WHERE
                    code_cli = 'borehole_identifier'
                    GROUP BY id_bho_fk
            ) as ids
            ON
                ids.id_bho_fk = borehole.id_bho
                
            INNER JOIN bdms.workgroups
            ON id_wgp = id_wgp_fk

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
                v.id_bho_fk = borehole.id_bho

            INNER JOIN
                bdms.completness
            ON
                completness.id_bho = borehole.id_bho

            LEFT JOIN
                bdms.users as locker
            ON
                locked_by_bho = locker.id_usr

            INNER JOIN
                bdms.users as creator
            ON
                created_by_bho = creator.id_usr

            LEFT JOIN (
                SELECT
                    id_bho_fk,
                    array_to_json(
                        array_agg(
                            json_build_object(
                                'id', id,
                                'kind', kind,
                                'layers', layers,
                                'date', date
                            )
                        )
                    ) AS stratigraphy
                FROM (
                    SELECT
                        id_bho_fk,
                        id_sty AS id,
                        stratigraphy.kind_id_cli AS kind,
                        to_char(
                            date_sty, 'YYYY-MM-DD'
                        ) AS date,
                        COUNT(id_lay) AS layers
                    FROM
                        bdms.stratigraphy
                    LEFT JOIN bdms.layer
                        ON layer.id_sty_fk = id_sty
                    GROUP BY id_bho_fk, id_sty, kind, date_sty
                    ORDER BY date_sty DESC, id_sty DESC
                ) t
                GROUP BY id_bho_fk
            ) AS strt1
            ON
                strt1.id_bho_fk = borehole.id_bho
        """

        cntSql = """
            SELECT
                count(*) AS cnt
            FROM
                bdms.borehole

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

            LEFT JOIN (
                SELECT
                    id_bho_fk,
                    array_agg(id_cli_fk) as borehole_identifier,
                    array_agg(value_bco) as identifier_value
                FROM
                    bdms.borehole_codelist
                WHERE
                    code_cli = 'borehole_identifier'
                    GROUP BY id_bho_fk
            ) as ids
            ON
                ids.id_bho_fk = id_bho

            INNER JOIN
                bdms.completness
            ON
                completness.id_bho = borehole.id_bho

            INNER JOIN
                bdms.users as creator
            ON
                created_by_bho = creator.id_usr
        """

        if len(layer_params) > 0:
            joins_string = "\n".join(layer_joins) if len(
                layer_joins) > 0 else ''
            where_string = (
                "AND {}".format(" AND ".join(layer_where))
                if len(layer_where) > 0
                else ''
            )

            strt_sql = """
                INNER JOIN (
                    SELECT DISTINCT
                        id_bho_fk,
                        name_sty,
                        casng_date_abd_sty,
                        stratigraphy.casng_id,
                        instr_kind_id_cli

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
                ) as strt2
                ON 
                    borehole.id_bho = strt2.id_bho_fk
            """.format(
                joins_string, where_string
            )
            rowsSql += strt_sql
            cntSql += strt_sql

        if len(casing_params) > 0:

            joins_string = "\n".join(casing_joins) if len(
                casing_joins) > 0 else ''
            
            where_string = (
                " AND {}".format(" AND ".join(casing_where))
                if len(casing_where) > 0
                else ''
            )

            strt_sql = """
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

            rowsSql += strt_sql
            cntSql += strt_sql

        if len(backfill_params) > 0:

            joins_string = "\n".join(backfill_joins) if len(
                backfill_joins) > 0 else ''
            where_string = (
                " AND {}".format(" AND ".join(backfill_where))
                if len(backfill_where) > 0
                else ''
            )

            strt_sql = """
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

            rowsSql += strt_sql
            cntSql += strt_sql

        if len(instrument_params) > 0:

            joins_string = "\n".join(instrument_joins) if len(
                instrument_joins) > 0 else ''
            where_string = (
                " AND {}".format(" AND ".join(instrument_where))
                if len(instrument_where) > 0
                else ''
            )

            strt_sql = """
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

            rowsSql += strt_sql
            cntSql += strt_sql

        if len(where) > 0:
            rowsSql += """
                WHERE {}
            """.format(
                " AND ".join(where)
            )
            cntSql += """
                WHERE {}
            """.format(
                " AND ".join(where)
            )

        if permissions is not None:
            operator = 'AND' if len(where) > 0 else 'WHERE'
            rowsSql += """
                {} {}
            """.format(
                operator, permissions
            )
            cntSql += """
                {} {}
            """.format(
                operator, permissions
            )

        _orderby, direction = self.getordering(orderby, direction)

        sql = """
            SELECT
                array_to_json(
                    array_agg(
                        row_to_json(t)
                    )
                ),
                COALESCE((
                    %s
                ), 0)
            FROM (
                %s
            ORDER BY %s %s NULLS LAST
                %s
            ) AS t
        """ % (
            cntSql,
            rowsSql,
            _orderby,
            direction,
            paging
        )

        rec = await self.conn.fetchrow(
            sql, *(layer_params + casing_params +
                   backfill_params + instrument_params + params)
        )
        return {
            "data": self.decode(rec[0]) if rec[0] is not None else [],
            "orderby": orderby,
            "direction": direction,
            "page": page if page is not None else 1,
            "pages": math.ceil(rec[1]/limit) if limit is not None else 1,
            "rows": rec[1]
        }
