# -*- coding: utf-8 -*-
import asyncio
from bms.v1.action import Action
from bms.v1.exceptions import (
    DuplicateException
)
from bms.v1.borehole.geom.patch import PatchGeom
import json


class PublishTerms(Action):

    async def execute(self):

        # Check if draft exists
        exists = await self.conn.fetchval("""
            SELECT EXISTS(
                SELECT 1
                FROM
                    bdms.terms
                WHERE
                    draft_tes IS TRUE
            ) AS exists
        """)

        if exists is False:
            raise Exception("Draft not exists")

        try:            
            # Begin transaction
            await self.conn.execute("BEGIN;")

            # Expire current terms record
            await self.conn.execute("""
                UPDATE
                    bdms.terms
                SET
                    expired_tes = now()
                WHERE
                    expired_tes IS NULL
                AND
                    draft_tes IS FALSE
            """)

            # Promote draft to current terms
            await self.conn.execute("""
                UPDATE
                    bdms.terms
                SET
                    draft_tes = FALSE
                WHERE
                    expired_tes IS NULL
                AND
                    draft_tes IS TRUE
            """)

            # Commit changes to db
            await self.conn.execute("COMMIT;")

            return None

        except Exception:
            await self.conn.execute("ROLLBACK;")
            raise Exception("Error while accepting terms")
