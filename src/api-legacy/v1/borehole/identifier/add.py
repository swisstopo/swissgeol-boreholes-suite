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
                INSERT INTO bdms.borehole_identifiers_codelist(
                    borehole_id,
                    identifier_id,
                    identifier_value
                )
                VALUES (
                    $1,
                    $2,
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
