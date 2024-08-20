# -*- coding: utf-8 -*-
from bms import (
    AuthorizationException,
    WorkgroupFreezed,
    BaseHandler,
    EDIT,
    Locked
)
from bms.v1.borehole import (
    Lock
)
from datetime import (
    datetime,
    timedelta,
    timezone
)
import json


class Producer(BaseHandler):

    def authorize(self):
        pass

    async def check_edit(self, id, user, conn):
        id_wgp = await conn.fetchval("""
            SELECT
                id_wgp_fk
            FROM
                bdms.borehole
            WHERE
                id_bho = $1
        """, id)
        for w in self.user['workgroups']:
            if (
                w['id'] == id_wgp and
                (
                    w['disabled'] is not None or
                    (
                        'EDIT' not in w['roles']
                    )
                )
            ):
                raise WorkgroupFreezed()

    async def check_lock(self, id, user, conn):
        rec = await conn.fetchrow("""
            SELECT
                t.*,
                row_to_json(t)
            FROM (
                SELECT
                    locked_bho,
                    locked_by_bho,
                    firstname || ' ' || lastname as name,
                    status[array_length(status, 1)]  ->> 'role' as "role",
                    borehole.id_wgp_fk as wid

                FROM
                    bdms.borehole

                INNER JOIN
                    bdms.workgroups
                ON
                    id_wgp = id_wgp_fk

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
                            id_wkf
                    ) t
                    GROUP BY
                        id_bho_fk
                ) as v
                ON
                    v.id_bho_fk = id_bho

                LEFT JOIN
                    bdms.users
                ON
                    users.id_usr = borehole.locked_by_bho

                WHERE
                    id_bho = $1
            ) AS t
        """, id)

        if rec is None:
            raise Exception(f"Borehole with id: '{id}' not exists")

        # Lockable by editors if borehole belong to user
        # group and borehole role is same as user's

        workgroup = None
        for wg in user['workgroups']:
            if wg['id'] == rec[4]:
                workgroup = wg

        if workgroup is None or rec[3] not in workgroup['roles']:
            raise AuthorizationException()

        now = datetime.now(timezone.utc)

        td = timedelta(minutes=Lock.lock_timeout)

        locked_at = rec[0]
        locked_by = rec[1]
        locked_by_name = rec[2]

        if (
            locked_at is not None and     # Locked by someone
            locked_by != user['id'] and   # Someone is not the current user
            (now - locked_at) < (td)      # Timeout not finished
        ):
            raise Locked(
                id,
                {
                    "user": locked_by_name,
                    "datetime": locked_at.isoformat()
                }
            )

        return json.loads(rec[6])
