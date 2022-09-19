# -*- coding: utf-8 -*-
from bms.v1.action import Action
import math


class ListFilesBorehole(Action):

    sql = """
        SELECT
            id_fil AS id,
            name_fil AS name,
            type_fil AS type,
            COALESCE(description_bfi, '') AS description,
            -- public_bfi AS public,
            username,
            to_char(
                uploaded_fil,
                'YYYY-MM-DD"T"HH24:MI:SSOF'
            ) as uploaded

        FROM
            bdms.files

        INNER JOIN
            bdms.borehole_files
        ON
            id_fil_fk = id_fil
        AND
            id_bho_fk = $1

        INNER JOIN
            bdms.users
        ON
            borehole_files.id_usr_fk = id_usr

        INNER JOIN
            bdms.borehole
        ON
            borehole.id_bho = borehole_files.id_bho_fk
    """

    async def execute(self, id, user):

        # Prepare filter for user
        #  - viewer can list only published borehole and files
        #  - editors can list published and workgroup belonging boreholes

        where = []

        if user['viewer'] == True:
            where.append(f"""(
                borehole.public_bho IS TRUE
                AND public_bfi IS TRUE
            )""")

        if user['workgroups'] is not None:
            for workgroup in user['workgroups']:
                where.append(f"""
                    id_wgp_fk = {workgroup['id']}
                """)

        # Preparing & executing main SQL query adding user permissions filter
        result = await self.conn.fetchval(
            """
            SELECT
                array_to_json(
                    array_agg(
                        row_to_json(t)
                    )
                )
            FROM (
                {}
                WHERE
                    ({})
            ) t
            """.format(
                ListFilesBorehole.sql,
                ' OR '.join(where)
            ), id
        )

        return {
            "data": self.decode(result) if result is not None else []
        }
