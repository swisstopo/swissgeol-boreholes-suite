# -*- coding: utf-8 -*-
from bms import EDIT
from bms.v1.action import Action


class CreateWorkflow(Action):

    async def execute(self, id, user, role=EDIT, done=False):
        if done is True:
            return {
                "id": (
                    await self.conn.fetchval("""
                            INSERT INTO bdms.workflow(
                                id_bho_fk,
                                id_usr_fk,
                                id_rol_fk,
                                finished_wkf,
                            ) VALUES (
                                $1, $2, $3, now()
                            ) RETURNING id_wkf
                        """,
                        id, user['id'], role
                    )
                )
            }
        
        return {
            "id": (
                await self.conn.fetchval("""
                        INSERT INTO bdms.workflow(
                            id_bho_fk,
                            id_usr_fk,
                            id_rol_fk
                        ) VALUES (
                            $1, $2, $3
                        ) RETURNING id_wkf
                    """,
                    id, user['id'], role
                )
            )
        }
