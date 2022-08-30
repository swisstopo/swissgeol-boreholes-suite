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
                        bdms.borehole_codelist
                    WHERE 
                        id_bho_fk = $1
                    AND
                        id_cli_fk = $2
                    AND
                        code_cli = 'borehole_identifier'
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
                    bdms.borehole_codelist
                WHERE
                    id_bho_fk = $1
                AND
                    id_cli_fk = $2
                AND
                    code_cli = 'borehole_identifier'
            """,
            id,
            cid
        )

        return None
