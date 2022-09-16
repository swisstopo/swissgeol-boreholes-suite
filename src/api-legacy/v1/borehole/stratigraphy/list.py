# -*- coding: utf-8 -*-
from bms.v1.action import Action
import math


class ListStratigraphies(Action):

    async def execute(self, limit=None, page=None, filter={}, user=None):

        paging = ''
        params = []
        where = []
        fkeys = filter.keys()

        permissions = None
        if user is not None:
            permissions = self.filterPermission(user)

        if 'borehole' in fkeys and filter['borehole'] != '':
            params.append(filter['borehole'])
            where.append("""
                stratigraphy.id_bho_fk = %s
            """ % self.getIdx())

        if 'kind' in fkeys and filter['kind'] != '':
            params.append(filter['kind'])
            where.append("""
                stratigraphy.kind_id_cli = %s
            """ % self.getIdx())

        if limit is not None and page is not None:
            paging = """
                LIMIT %s
                OFFSET %s
            """ % (self.getIdx(), self.getIdx())
            params += [
                limit, (int(limit) * (int(page) - 1))
            ]

        rowsSql = """
            SELECT
                id_sty as id,
                stratigraphy.id_bho_fk as borehole,
                stratigraphy.kind_id_cli AS kind,
                name_sty as name,
                primary_sty as primary,
                to_char(
                    date_sty,
                    'YYYY-MM-DD'
                ) as date
            FROM
                bdms.stratigraphy

            INNER JOIN bdms.borehole
            ON stratigraphy.id_bho_fk = id_bho

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

        """

        cntSql = """
            SELECT count(*) AS cnt
            FROM bdms.stratigraphy

            INNER JOIN bdms.borehole
            ON id_bho_fk = id_bho
            
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
        """

        if len(where) > 0:
            rowsSql += """
                WHERE %s
            """ % " AND ".join(where)
            cntSql += """
                WHERE %s
            """ % " AND ".join(where)


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
            ORDER BY date_sty desc
                %s
            ) AS t
        """ % (cntSql, rowsSql, paging)

        rec = await self.conn.fetchrow(
            sql, *(params)
        )
        return {
            "data": self.decode(rec[0]) if rec[0] is not None else [],
            "page": page if page is not None else 1,
            "pages": math.ceil(rec[1]/limit) if limit is not None else 1,
            "rows": rec[1]
        }
