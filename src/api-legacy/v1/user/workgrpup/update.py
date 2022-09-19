# -*- coding: utf-8 -*-
from bms.v1.action import Action


class UpdateWorkgroup(Action):

    async def execute(self, id, name):
        return {
            "id": (
                await self.conn.fetchval("""
                    UPDATE
                        bdms.workgroups
                    
                    SET
                        name_wgp = $1

                    WHERE
                        id_wgp = $2
                    """,
                    name, id
                )
            )
        }
