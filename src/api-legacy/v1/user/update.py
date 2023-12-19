# -*- coding: utf-8 -*-
from bms.v1.action import Action
from . import CheckUsername
from bms.v1.exceptions import DuplicateException


class UpdateUser(Action):

    async def execute(
        self, user_id, username,
        firstname = '', middlename = '', lastname = '',
        admin = False
    ):

        old_username = await self.conn.fetchval("""
            SELECT
                username
            FROM
                bdms.users
            WHERE
                id_usr = $1
        """, user_id)

        if old_username != username:
            exists = await (CheckUsername(self.conn)).execute(username)
            if exists['exists']:
                raise DuplicateException()

        return {
            "id": (
                await self.conn.fetchval("""
                    UPDATE
                        bdms.users

                    SET
                        admin_usr = $1,
                        username = $2,
                        firstname = $3,
                        middlename = $4,
                        lastname = $5

                    WHERE
                        id_usr = $6
                    """,
                    admin,
                    username,
                    firstname if firstname != '' else username,
                    middlename,
                    lastname,
                    user_id
                )
            )
        }

