# -*- coding: utf-8 -*-
import asyncio
from bms.v1.action import Action
from bms.v1.exceptions import (
    DuplicateException
)
from bms.v1.borehole.geom.patch import PatchGeom
import json


class PublishContent(Action):

    async def execute(self, name):

        # Check if draft exists
        exists = await self.conn.fetchval("""
            SELECT EXISTS(
                SELECT 1
                FROM
                    bdms.contents
                WHERE
                    draft_cnt IS TRUE
                AND
                    name_cnt = $1
            ) AS exists
        """, name)

        if exists is False:
            raise Exception("Draft not exists")

        try:            
            # Begin transaction
            await self.conn.execute("BEGIN;")

            # Expire current content record
            await self.conn.execute("""
                UPDATE
                    bdms.contents
                SET
                    expired_cnt = now()
                WHERE
                    expired_cnt IS NULL
                AND
                    draft_cnt IS FALSE
                AND
                    name_cnt = $1
            """, name)

            # Promote draft to current content
            await self.conn.execute("""
                UPDATE
                    bdms.contents
                SET
                    draft_cnt = FALSE
                WHERE
                    expired_cnt IS NULL
                AND
                    draft_cnt IS TRUE
                AND
                    name_cnt = $1
            """, name)

            # Commit changes to db
            await self.conn.execute("COMMIT;")

            return None

        except Exception:
            await self.conn.execute("ROLLBACK;")
            raise Exception("Error while publishing content")
