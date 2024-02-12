# -*- coding: utf-8 -*-
from bms.v1.action import Action
import math


class ListProfiles(Action):


    sql = """
        SELECT
            id_sty as id,
            stratigraphy.id_bho_fk as borehole,
            stratigraphy.kind_id_cli AS kind,
            name_sty as name,
            primary_sty as primary,
            quality_id_sty as quality,
            to_char(
                date_sty,
                'YYYY-MM-DD'
            ) as date

        FROM
            bdms.stratigraphy

        INNER JOIN
            bdms.borehole
        ON
            stratigraphy.id_bho_fk = id_bho

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

    async def execute(self, borehole, kind, user=None):
        """Return a list of profiles for a borehole.

id: borehole id
user: user requesting the list

        """

        where = ""

        permissions = None
        if user is not None:
            permissions = self.filterPermission(user)
            if permissions is not None:
                where = """
                    AND {}
                """.format(permissions)

        rec = await self.conn.fetchval(
            """
                SELECT
                    array_to_json(
                        array_agg(
                            row_to_json(t)
                        )
                    )
                FROM (
                    %s
                    WHERE
                        stratigraphy.id_bho_fk = $1
                    AND
                        stratigraphy.kind_id_cli = $2
                    %s
                    ORDER BY date_sty desc
                ) AS t
            """ % (self.sql, where),
            borehole, kind
        )

        return {
            "data": self.decode(rec, [])
        }
