# -*- coding: utf-8 -*-
from bms import EDIT
from bms.v1.action import Action
from bms.v1.exceptions import (
    NotFound,
    DeleteReferenced
)


class DeleteIdentifier(Action):

    async def execute(self, id):

        # Check if identifier already exists
        check = await self.conn.fetchval("""
            SELECT
                schema_cli
            FROM
                bdms.codelist
            WHERE
                id_cli = $1
        """, id)

        if check != 'borehole_identifier':
            raise NotFound()

        # Check if identifier assigned to boreholes
        check = await self.conn.fetchval("""
            SELECT EXISTS (
                SELECT
                    id_bho_fk
                FROM
                    bdms.borehole_codelist
                WHERE
                    id_cli_fk = $1
                LIMIT 1
            ) as has_bh
        """, id)

        if check is True:
            raise DeleteReferenced()    

        await self.conn.execute("""
            DELETE FROM bdms.codelist
            WHERE id_cli = $1
        """, id)

        return None
