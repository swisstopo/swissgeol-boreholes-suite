# -*- coding: utf-8 -*-
from bms.v1.action import Action
from . import CheckUsername
from bms.v1.exceptions import DuplicateException


class CreateUser(Action):

    async def execute(
        self, username, password,
        firstname = '', middlename = '', lastname = '',
        admin = False
    ):
        exists = await (CheckUsername(self.conn)).execute(username)
        if exists['exists']:
            raise DuplicateException()

        return {
            "id": (
                await self.conn.fetchval("""
                    INSERT INTO bdms.users(
                        admin_usr,
                        viewer_usr,
                        username,
                        password,
                        firstname,
                        middlename,
                        lastname
                    )
                    VALUES (
                        $6,
                        True,
                        $1,
                        crypt($2, gen_salt('md5')),
                        $3,
                        $4,
                        $5
                    )
                    RETURNING id_usr
                    """,
                    username,
                    password,
                    firstname if firstname != '' else username,
                    middlename,
                    lastname,
                    admin
                )
            )
        }
