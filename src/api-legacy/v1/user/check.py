# -*- coding: utf-8 -*-
from bms.v1.action import Action


class CheckUsername(Action):

    async def execute(self, username):
        return {
            "exists": (
                await self.conn.fetchval(
                """
                    SELECT EXISTS(
                        SELECT 1
                        FROM
                            bdms.users
                        WHERE
                            username = $1
                    );
                """, username)
            )
        }
