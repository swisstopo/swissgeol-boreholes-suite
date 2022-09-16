# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms import (
    AuthorizationException
)
import math


class EditingListFilesBorehole(Action):

    sql = """
        SELECT
            id_fil AS id,
            name_fil AS name,
            type_fil AS type,
            COALESCE(description_bfi, '') AS description,
            public_bfi AS public,
            to_char(
                uploaded_fil,
                'YYYY-MM-DD"T"HH24:MI:SSOF'
            ) as uploaded,
            username

        FROM
            bdms.files

        INNER JOIN
            bdms.borehole_files
        ON
            id_fil_fk = id_fil

        INNER JOIN
            bdms.users
        ON
            borehole_files.id_usr_fk = id_usr
    """

    async def execute(self, id, user):

        # Prepare filter for user
        #  - viewer can list only published borehole and files
        #  - editors can list published and workgroup belonging boreholes

        where = []

        if (
            user['workgroups'] is None or
            len(user['workgroups']) == 0
        ):
            raise AuthorizationException()

        # Check if requested borehole attachments belong
        #  to the user's workgroup

        for workgroup in user['workgroups']:
            where.append(f"""
                id_wgp_fk = {workgroup['id']}
            """)

        exists = await self.conn.fetchval(
            """
                SELECT EXISTS(
                    SELECT 1
                    FROM bdms.borehole
                    WHERE
                        id_bho = $1
                    AND
                        ({})
                ) AS exists
            """.format(
                ' OR '.join(where)
            ), id
        )

        if exists is False:
            raise AuthorizationException()

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

                INNER JOIN
                    bdms.borehole
                ON
                    borehole.id_bho = borehole_files.id_bho_fk

                WHERE
                    ({})
                AND
                    id_bho_fk = $1
            ) t
            """.format(
                EditingListFilesBorehole.sql,
                ' OR '.join(where)
            ), id
        )

        return {
            "data": self.decode(result) if result is not None else []
        }
