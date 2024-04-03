# -*- coding: utf-8 -*-
from bms.v1.action import Action


class DeleteBoreholes(Action):

    async def execute(self, ids):
        await self.conn.execute("""
                DELETE FROM bdms.borehole
                WHERE id_bho = ANY($1)
            """, ids
        )
        return None
