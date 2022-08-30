# -*- coding: utf-8 -*-
from bms.v1.borehole.get import GetBorehole
from bms import Locked
from datetime import datetime
from datetime import timedelta


class StartEditing(GetBorehole):

    async def execute(self, id, user):

        # Lock row for current user
        await self.conn.execute("""
            UPDATE bdms.borehole SET
                locked_bho = current_timestamp,
                locked_by_bho = $1
            WHERE id_bho = $2;
        """, user['id'], id)

        # return borehole data
        return await super().execute(id, True)
