# -*- coding: utf-8 -*-
from bms.v1.action import Action
import math


class ListEditingBorehole(Action):

    async def execute(
        self, limit=None, page=None,
        filter={}, orderby=None, direction=None, user=None,feature_ids=None,
    ):

        permissions = None
        if user is not None:
            # Exclude VIEW role to filter out published boreholes
            permissions = self.filterPermission(user, ['VIEW'])

        paging = ''

        layer_where, layer_params, layer_joins = self.filterProfileLayers(
            filter)

        chronostratigraphy_where, chronostratigraphy_params, chronostratigraphy_joins = self.filterChronostratigraphy(filter)

        lithostratigraphy_where, lithostratigraphy_params, lithostratigraphy_joins = self.filterLithostratigraphy(filter)

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
                alternate_name_bho as alternate_name,
                borehole_type_id as borehole_type,
                restriction_id_cli as restriction,
                to_char(
                    restriction_until_bho,
                    'YYYY-MM-DD'
                ) as restriction_until,
                national_interest,
                location_x_bho as location_x,
                location_y_bho as location_y,
                location_x_lv03_bho as location_x_lv03,
                location_y_lv03_bho as location_y_lv03,
                precision_location_x,
                precision_location_y,
                precision_location_x_lv03,
                precision_location_y_lv03,
                reference_elevation_bho as reference_elevation,
                srs_id_cli as spatial_reference_system,
                elevation_z_bho as elevation_z,
                hrs_id_cli as height_reference_system,
                total_depth_bho as total_depth,

                (
                    select row_to_json(t)
                    FROM (
                        SELECT
                            status_id_cli as status,
                            purpose_id_cli as purpose
                    ) t
                ) as extended,
                stratigraphy as stratigraphy,
                array_to_json(status) as workflows,
                status[array_length(status, 1)]  ->> 'role' as "role"

            FROM
                bdms.borehole

            LEFT JOIN (
                SELECT
                    borehole_id,
                    array_agg(identifier_id) as borehole_identifier,
                    array_agg(identifier_value) as identifier_value
                FROM
                    bdms.borehole_identifiers_codelist
                GROUP BY borehole_id
            ) as ids
            ON
                ids.borehole_id = borehole.id_bho

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
                                'layers', layers,
                                'date', date
                            )
                        )
                    ) AS stratigraphy
                FROM (
                    SELECT
                        id_bho_fk,
                        id_sty AS id,
                        to_char(
                            date_sty, 'YYYY-MM-DD'
                        ) AS date,
                        COUNT(id_lay) AS layers
                    FROM
                        bdms.stratigraphy
                    LEFT JOIN bdms.layer
                        ON layer.id_sty_fk = id_sty
                    GROUP BY id_bho_fk, id_sty, date_sty
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
                    borehole_id,
                    array_agg(identifier_id) as borehole_identifier,
                    array_agg(identifier_value) as identifier_value
                FROM
                    bdms.borehole_identifiers_codelist
                GROUP BY borehole_id
            ) as ids
            ON
                ids.borehole_id = id_bho

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
                        name_sty

                    FROM
                        bdms.stratigraphy

                    INNER JOIN
                        bdms.layer
                    ON
                        id_sty_fk = id_sty

                    {}

                    {}

                ) as strt2
                ON
                    borehole.id_bho = strt2.id_bho_fk
            """.format(
                joins_string, where_string
            )
            rowsSql += strt_sql
            cntSql += strt_sql

        if len(chronostratigraphy_params) > 0:
            joins_string = "\n".join(chronostratigraphy_joins) if len(
                chronostratigraphy_joins) > 0 else ''
            where_string = (
                "AND {}".format(" AND ".join(chronostratigraphy_where))
                if len(chronostratigraphy_where) > 0
                else ''
            )

            strt_sql = """
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
            rowsSql += strt_sql
            cntSql += strt_sql

        if len(lithostratigraphy_params) > 0:
            joins_string = "\n".join(lithostratigraphy_joins) if len(
                lithostratigraphy_joins) > 0 else ''
            where_string = (
                "AND {}".format(" AND ".join(lithostratigraphy_where))
                if len(lithostratigraphy_where) > 0
                else ''
            )

            strt_sql = """
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

        # Filtering by a list of IDs
        if feature_ids:
            ids_placeholder = ', '.join(map(str, feature_ids))
            where_clause = f"borehole.id_bho IN ({ids_placeholder})"
            if "WHERE" in rowsSql:
                rowsSql += f" AND {where_clause}"
                cntSql += f" AND {where_clause}"
            else:
                rowsSql += f" WHERE {where_clause}"
                cntSql += f" WHERE {where_clause}"

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
            sql, *(layer_params + chronostratigraphy_params + lithostratigraphy_params + params)
        )
        return {
            "data": self.decode(rec[0]) if rec[0] is not None else [],
            "orderby": orderby,
            "direction": direction,
            "page": page if page is not None else 1,
            "pages": math.ceil(rec[1]/limit) if limit is not None else 1,
            "rows": rec[1]
        }
