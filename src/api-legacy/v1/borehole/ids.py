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

            INNER JOIN
                bdms.users as creator
            ON
                created_by_bho = creator.id_usr
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
