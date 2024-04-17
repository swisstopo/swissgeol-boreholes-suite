# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.exceptions import NotFound


class RemoveIdentifier(Action):

    async def execute(self, id, cid):

        # Check if identifier exists
        check = await self.conn.fetchval(
            """
                SELECT EXISTS(
                    SELECT 1
                    FROM
                        bdms.borehole_identifiers_codelist
                    WHERE 
                        borehole_id = $1
                    AND
                        identifier_id = $2
                ) AS exists
            """,
            id,
            cid
        )

        if not check:
            raise NotFound()

        await self.conn.fetchval(
            """
                DELETE FROM
                    bdms.borehole_identifiers_codelist
                WHERE
                    borehole_id = $1
                AND
                    identifier_id = $2
            """,
            id,
            cid
        )

        return None
