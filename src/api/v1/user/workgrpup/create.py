# -*- coding: utf-8 -*-
from bms import (
    DuplicateException
)
from bms.v1.action import Action


class CreateWorkgroup(Action):

    async def execute(self, name, is_supplier = False):
        exists = await self.conn.fetchval(
        """
            SELECT EXISTS(
                SELECT 1
                FROM
                    bdms.workgroups
                WHERE
                    name_wgp = $1
            );
        """, name)
        if exists:
            raise DuplicateException()

        return {
            "id": (
                await self.conn.fetchval("""
                    INSERT INTO bdms.workgroups(
                        name_wgp,
                        settings_wgp,
                        supplier_wgp
                    )
                    VALUES (
                        $1,
                        '{}',
                        $2
                    )
                    RETURNING id_wgp
                """,
                    name, is_supplier
                )
            )
        }
