# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.exceptions import DuplicateException


class UpdateUser(Action):

    async def execute(
        self, user_id, admin = False
    ):

        return {
            "id": (
                await self.conn.fetchval("""
                    UPDATE
                        bdms.users

                    SET
                        admin_usr = $1

                    WHERE
                        id_usr = $2
                    """,
                    admin,
                    user_id
                )
            )
        }
