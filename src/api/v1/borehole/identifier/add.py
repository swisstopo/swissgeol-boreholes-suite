# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.exceptions import NotFound


class AddIdentifier(Action):

    async def execute(self, id, cid, value):

        # Check if identifier exists
        check = await self.conn.fetchval(
            """
                SELECT
                    schema_cli
                FROM
                    bdms.codelist
                WHERE
                    id_cli = $1
            """,
            cid
        )

        if check != 'borehole_identifier':
            raise NotFound()

        await self.conn.fetchval(
            """
                INSERT INTO bdms.borehole_codelist(
                    id_bho_fk,
                    id_cli_fk,
                    code_cli,
                    value_bco
                )
                VALUES (
                    $1,
                    $2,
                    'borehole_identifier',
                    $3
                )
            """,
            id,
            cid,
            value
        )

        return {
            "data": {
                "id": cid,
                "value": value
            }
        }
