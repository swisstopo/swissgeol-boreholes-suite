# -*- coding: utf-8 -*-
from bms.v1.action import Action


class ExportStatus(Action):

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

        if row is None:
            return {
                "data": {
                    "status": "empty"
                }
            }


        payload = self.decode(row[4])
        print(payload)

        ret = {
            "status": payload["status"],
            "date": row[3]
        }

        if 'file' in payload:
            ret.update({
                "id": payload["file"]
            })

        return {
            "data": ret
        }
