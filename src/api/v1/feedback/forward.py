# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.utils import SendMail
from bms.v1.feedback.get import GetFeedback
from bms.v1.exceptions import NotFound


class ForwardFeedback(Action):

    async def execute(
        self,
        feb_id,
        username,
        password,
        recipients,
        server,
        port,
        tls,
        starttls,
        sender=None
    ):
        try:
            # Getting the feedback from the db
            get = GetFeedback(self.conn)
            feedback = await get.execute(feb_id)

            if feedback is None:
                raise NotFound()

            feedback = feedback['data']

            # Preparing the email message
            message = f"""TAG: {feedback['tag']}
DATE: {feedback['created']}
SENDER: {feedback['user']}

MESSAGE:
{feedback['message']}
            """

            # Send the email
            send = SendMail()
            await send.execute(
                recipients,
                f"[SWISSFORAGE][{feedback['tag']}] Feedback",
                message,
                server,
                port=port,
                username=username,
                password=password,
                tls=tls,
                starttls=starttls,
                sender=username
            )

            await self.conn.execute("""
                UPDATE
                    bdms.feedbacks
                SET
                    frw_feb = TRUE
                WHERE
                    id_feb = $1
            """, feb_id)

            return None

        except Exception:
            raise Exception("Error while forwarding feedback")
