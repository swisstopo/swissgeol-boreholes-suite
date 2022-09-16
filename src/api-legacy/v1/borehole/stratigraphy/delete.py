# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms import Locked
from datetime import datetime
from datetime import timedelta


class DeleteStratigraphy(Action):

    async def execute(self, id, user_id):

        # Check if deleting the primary startigraphy
        rec = await self.conn.fetchrow("""
            SELECT
                primary_sty,
                COALESCE(cnt, 0),
                s.id_bho_fk,
                s.kind_id_cli
            FROM
                bdms.stratigraphy as s
            LEFT JOIN (
                SELECT
                    id_bho_fk,
                    COUNT(*) cnt
                FROM
                    bdms.stratigraphy
                WHERE
                    primary_sty IS FALSE
                GROUP BY id_bho_fk
            ) a
                ON s.id_bho_fk = a.id_bho_fk
            WHERE
                id_sty = $1
        """, id)

        await self.conn.execute("""
                DELETE FROM
                    bdms.stratigraphy
                WHERE
                    id_sty = $1
            """, id)

        if rec[3] == 3000 and rec[0] and rec[1] > 0:  # The stratigraphy layer is primary
            # Setting the last created stratigraphy as primary
            id_sty = await self.conn.fetchval("""
                SELECT
                    id_sty
                FROM
                    bdms.stratigraphy
                WHERE
                    id_bho_fk = $1
                ORDER BY
                    creation_sty DESC
                LIMIT 1;
            """, rec[2])

            await self.conn.execute("""
                UPDATE bdms.stratigraphy
                SET
                    primary_sty = True
                WHERE
                    id_sty = $1
            """, id_sty)

        return None
