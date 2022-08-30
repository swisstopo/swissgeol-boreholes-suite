# -*- coding: utf-8 -*-
from bms.v1.action import Action


class EnableWorkgroup(Action):

    async def execute(self, id):
        return {
            "id": (
                await self.conn.fetchval("""
                    UPDATE
                        bdms.workgroups
                    
                    SET
                        disabled_wgp = NULL

                    WHERE
                        id_wgp = $1
                    """,
                    id
                )
            )
        }
