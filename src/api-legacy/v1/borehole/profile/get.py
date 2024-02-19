# -*- coding: utf-8 -*-
from bms.v1.action import Action

class GetProfile(Action):

    async def execute(self, id, user=None):

        permission = ''

        if user is not None:
            permission = """
                AND {}
            """.format(
                self.filterPermission(user)
            )

        sql = GetGeologyProfile.sql

        rec = await self.conn.fetchrow(f"""
            SELECT
                row_to_json(t)
            FROM (
                
                {sql}

                WHERE
                    id_sty = $1

                {permission}
            ) AS t
        """, id)

        return {
            "data": self.decode(rec[0]) if rec[0] is not None else None
        }


class GetGeologyProfile(Action):

    sql = """
        SELECT
            (
                select row_to_json(t)
                FROM (
                    SELECT
                        id_bho as id
                ) t
            ) as borehole,
            id_sty as id,
            COALESCE(name_sty, '') as name,
            primary_sty as primary,
            to_char(
                date_sty,
                'YYYY-MM-DD'
            ) as date,
            to_char(
                update_sty,
                'YYYY-MM-DD'
            ) as updated,
            to_char(
                creation_sty,
                'YYYY-MM-DD'
            ) as created

        FROM
            bdms.stratigraphy

        INNER JOIN bdms.borehole
            ON stratigraphy.id_bho_fk = id_bho

        INNER JOIN (
            SELECT
                id_bho_fk,
                array_agg(
                    json_build_object(
                        'workflow', id_wkf,
                        'role', name_rol,
                        'username', username,
                        'started', started,
                        'finished', finished
                    )
                ) as status
            FROM (
                SELECT
                    id_bho_fk,
                    name_rol,
                    id_wkf,
                    username,
                    started_wkf as started,
                    finished_wkf as finished
                FROM
                    bdms.workflow,
                    bdms.roles,
                    bdms.users
                WHERE
                    id_rol = id_rol_fk
                AND
                    id_usr = id_usr_fk
                ORDER BY
                    id_bho_fk asc, id_wkf asc
            ) t
            GROUP BY
                id_bho_fk
        ) as v
        ON
            v.id_bho_fk = id_bho
    """
