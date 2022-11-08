# -*- coding: utf-8 -*-
from bms.v1.action import Action
from email.message import EmailMessage
import aiosmtplib
import traceback


class SendMail(Action):

    async def execute(
        self,
        recipients,
        subject,
        message,
        server,
        port,
        sender,
        password,
        tls,
        starttls
    ):
        
        try:
            msg = EmailMessage()
            msg["From"] = sender
            msg["To"] = recipients
            msg["Subject"] = subject
            msg.set_content(message)

            if password:
                await aiosmtplib.send(
                    msg,
                    sender=sender,
                    hostname=server,
                    port=port,
                    username=sender,
                    password=password,
                    use_tls=tls,
                    start_tls=starttls
                )
            else:
                await aiosmtplib.send(
                    msg,
                    sender=sender,
                    hostname=server,
                    port=port,
                    use_tls=tls,
                    start_tls=starttls
                )
            return None

        except Exception:
            print(traceback.print_exc())
            raise Exception("Error while sending email")
