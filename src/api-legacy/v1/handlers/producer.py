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
