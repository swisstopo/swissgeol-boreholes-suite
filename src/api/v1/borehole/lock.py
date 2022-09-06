# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms import (
    AuthorizationException,
    Locked,
    NotFound
)


class Lock(Action):

    async def execute(self, id, user):

        # Lock row for current user
        await self.conn.execute("""
            UPDATE bdms.borehole SET
                locked_bho = now(),
                locked_by_bho = $1
            WHERE id_bho = $2;
        """, user['id'], id)

        # also start workflow if not yet started
        row = await self.conn.fetchrow("""
            SELECT
                id_wkf,
                started_wkf

            FROM
                bdms.workflow

            WHERE
                id_bho_fk = $1

            ORDER BY
                id_wkf DESC

            LIMIT 1
        """, id)

        if row[1] is None:
            await self.conn.execute("""
                UPDATE bdms.workflow SET
                    started_wkf = current_timestamp,
                    id_usr_fk = $1
                WHERE id_wkf = $2;
            """, user['id'], row[0])

        res = await self.conn.fetchval("""
            SELECT row_to_json(t2)
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
                FROM
                    bdms.borehole
                INNER JOIN bdms.users as locker
                    ON locked_by_bho = locker.id_usr
                WHERE id_bho = $1
            ) t2
        """, id)

        return {
            "data": self.decode(res) if res is not None else None
        }
