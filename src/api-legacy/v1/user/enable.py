# -*- coding: utf-8 -*-
from bms.v1.action import Action


class EnableUser(Action):

    async def execute(self, id):
        return {
            "id": (
                await self.conn.fetchval("""
                    UPDATE
                        bdms.users
                    
                    SET
                        disabled_usr = NULL

                    WHERE
                        id_usr = $1
                    """,
                    id
                )
            )
        }
