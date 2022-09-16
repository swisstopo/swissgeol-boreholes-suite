# -*- coding: utf-8 -*-
from bms.v1.action import Action


class DeleteWorkgroup(Action):

    async def execute(self, id):

        # Check if user has done contributions
        boreholes = await self.conn.fetchval("""
            SELECT
                count(id_bho) as boreholes
                
            FROM bdms.workgroups
            
            LEFT JOIN bdms.borehole
            ON id_wgp = id_wgp_fk

            WHERE
                id_wgp = $1
            
            GROUP BY
                id_wgp
        """, id)

        if boreholes > 0:
            raise Exception(
                f"Workgroup cannot be deleted because of {boreholes} boreholes"
            )

        await self.conn.execute("""
            DELETE FROM bdms.workgroups
            WHERE id_wgp = $1
        """, id)

        return None
