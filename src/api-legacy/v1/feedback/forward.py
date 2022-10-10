# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.utils import SendMail
from bms.v1.feedback.get import GetFeedback
from bms.v1.exceptions import NotFound
import os

class ForwardFeedback(Action):

    async def execute(
        self,
        feb_id,
        sender,
        password,
        recipients,
        server,
        port,
        tls,
        starttls
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
ENVIRONMENT: {os.environ.get('APP_BASE_DOMAIN')} ({os.environ.get('APP_VERSION')}+{os.environ.get('APP_REVISION')})
DATE: {feedback['created']}
SENDER: {feedback['user']}

MESSAGE:
{feedback['message']}
            """

            # Send the email
            send = SendMail()
            await send.execute(
                recipients,
                f"[{feedback['tag']}] on {os.environ.get('APP_BASE_DOMAIN')}",
                message,
                server,
                port,
                sender,
                password,
                tls,
                starttls
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
