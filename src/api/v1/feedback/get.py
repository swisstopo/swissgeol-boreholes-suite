# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.utils.sendmail import SendMail


class GetFeedback(Action):

    async def execute(self, feb_id):
        try:
            # Check if already accepted
            val = await self.conn.fetchval(f"""
                SELECT
                    row_to_json(t)
                FROM (
                    SELECT
                        to_char(
                            created_feb,
                            'YYYY-MM-DD HH24:MI:SSOF'
                        ) AS created,
                        user_feb AS user,
                        message_feb AS message,
                        tag_feb AS tag
                    FROM
                        bdms.feedbacks
                    WHERE
                        id_feb = $1
                ) t
            """, feb_id)

            return {
                "data": self.decode(val) if val is not None else None
            }

        except Exception:
            raise Exception("Error while getting current terms")
