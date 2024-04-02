# -*- coding: utf-8 -*-
import asyncio
from bms.v1.action import Action
from bms.v1.exceptions import (
    PatchAttributeException
)
from bms.v1.borehole.patch import PatchBorehole


class MultiPatchBorehole(Action):

    async def execute(self, ids, fields, user):
        try:
            patch = PatchBorehole(self.conn)
            # tasks = []
            await self.conn.execute("BEGIN;")
            for id in ids:
                for field in fields:
                    await patch.execute(id, field[0], field[1], user)
                    
            await self.conn.execute("COMMIT;")
            return {}

        except PatchAttributeException as bmsx:
            await self.conn.execute("ROLLBACK;")
            raise bmsx

        except Exception:
            await self.conn.execute("ROLLBACK;")
            raise Exception("Error while updating borehole")
