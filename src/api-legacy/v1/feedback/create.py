# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.exceptions import WrongParameter


class CreateFeedback(Action):

    async def execute(self, user, message, tag):
        try:
            if tag not in [
                'DATA-ERROR',
                'BUG',
                'FEEDBACK'
            ]: 
                raise WrongParameter(f"tag={tag}")

            # Check if already accepted
            id_feb = await self.conn.fetchval(f"""
                INSERT INTO bdms.feedbacks(
                    user_feb, message_feb, tag_feb
                )
                VALUES (
                    $1, $2, $3
                )
                RETURNING id_feb;
            """, user, message, tag)
            
            return {
                "data": {
                    "feb_id": id_feb
                }
            }

        except Exception:
            raise Exception("Error while getting current terms")
