# -*- coding: utf-8 -*-
from bms.v1.action import Action


class ExportCancel(Action):

    async def execute(self):

        # Fetch database searching for the last export
        row = await self.conn.fetchrow(
            """
                SELECT
                    events.id_evs,
                    id_usr_fk,
                    topic_evs,
                    to_char(
                        created_evs,
                        'YYYY-MM-DD"T"HH24:MI:SSOF'
                    ),
                    payload_evs
                    
                FROM bdms.events

                INNER JOIN (
                    SELECT
                        max(id_evs) as id_evs
                    FROM
                        bdms.events
                    WHERE
                        topic_evs = 'DATABASE.EXPORT'
                        
                ) AS f
                ON events.id_evs = f.id_evs
            """
        )

        if row:
            await self.conn.execute(
                """
                    DELETE FROM
                        bdms.events
                    WHERE
                        id_evs = $1
                """, row[0]
            )

        return {}
