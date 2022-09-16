# -*- coding: utf-8 -*-
from bms.v1.action import Action


class DetachFile(Action):

    async def execute(self, id, file_id, user=None):

        # Delete the link between the file and the borehole
        await self.conn.execute("""
            DELETE FROM
                bdms.borehole_files
            WHERE
                id_bho_fk = $1
            AND
                id_fil_fk = $2
        """, id, file_id)

        return None
