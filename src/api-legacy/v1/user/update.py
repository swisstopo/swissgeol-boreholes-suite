# -*- coding: utf-8 -*-
from bms.v1.action import Action
from . import CheckUsername
from bms.v1.exceptions import DuplicateException


class UpdateUser(Action):

    async def execute(
        self, user_id, admin = False
    ):

        old_username = await self.conn.fetchval("""
            SELECT
                username
            FROM
                bdms.users
            WHERE
                id_usr = $1
        """, user_id)

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
