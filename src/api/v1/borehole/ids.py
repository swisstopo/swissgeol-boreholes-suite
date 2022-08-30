# -*- coding: utf-8 -*-
from bms.v1.action import Action
import math


class BoreholeIds(Action):

    async def execute(self, filter={}, user=None):

        permissions = None
        if user is not None:
            # Exclude VIEW role to filter out published boreholes
            permissions = self.filterPermission(user, ['VIEW'])

        where, params = self.filterBorehole(filter)

        sql = """
            SELECT
                array_agg(borehole.id_bho)

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

            INNER JOIN
                bdms.users as creator
            ON
                created_by_bho = creator.id_usr

            INNER JOIN
                bdms.completness
            ON
                completness.id_bho = borehole.id_bho
        """

        if len(where) > 0:
            sql += """
                WHERE %s
            """ % " AND ".join(where)

        if permissions is not None:
            operator = 'AND' if len(where) > 0 else 'WHERE'
            sql += """
                {} {}
            """.format(
                operator, permissions
            )

        rec = await self.conn.fetchval(
            sql, *(params)
        )

        return {
            "data": rec if rec is not None else []
        }
