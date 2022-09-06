# -*- coding: utf-8 -*-
from bms.v1.action import Action


class SetRole(Action):

    async def execute(
        self, user_id, workgroup_id, role_name, active = True
    ):
        id_rol = await self.conn.fetchval("""
            SELECT
                id_rol
	        FROM
                bdms.roles
            WHERE
                name_rol = $1
        """, role_name)

        if id_rol is None:
            raise Exception(f"Not found {role_name}")

        if active is False:
            await self.conn.execute("""
                DELETE FROM
                    bdms.users_roles
                WHERE
                    id_usr_fk = $1
                AND
                    id_rol_fk = $2
                AND
                    id_wgp_fk = $3
            """, user_id, id_rol, workgroup_id)

        else:
            # Check if ROLE (role_name) already assigned
            val = await self.conn.fetchrow("""
                SELECT
                    id_usr_fk,
                    id_rol_fk,
                    id_wgp_fk
                FROM
                    bdms.users_roles
                WHERE
                    id_usr_fk = $1
                AND
                    id_rol_fk = $2
                AND
                    id_wgp_fk = $3
            """, user_id, id_rol, workgroup_id)

            if val is None:
                await self.conn.execute("""
                    INSERT INTO bdms.users_roles(
                        id_usr_fk, id_rol_fk, id_wgp_fk)
                    VALUES ($1, $2, $3);
                """, user_id, id_rol, workgroup_id)

        return None
