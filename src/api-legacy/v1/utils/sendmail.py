# -*- coding: utf-8 -*-
from bms.v1.action import Action
from email.message import EmailMessage
import aiosmtplib
import traceback


class SendMail(Action):

    async def execute(
        self,
        recipients, # csv list of emails
        subject,
        message,
        server,
        port=587,
        username=None,
        password=None,
        tls=False,
        starttls=False  # usually on port 587
    ):
        
        try:

            if username is None:
                raise Exception("Uusername is mandatory")

            msg = EmailMessage()
            msg["From"] = username
            msg["To"] = recipients
            msg["Subject"] = subject
            msg.set_content(message)

            if username is not None and password is not None:
                await aiosmtplib.send(
                    msg,
                    hostname=server,
                    port=port,
                    username=username,
                    password=password,
                    use_tls=tls,
                    start_tls=starttls
                )
            else:
                await aiosmtplib.send(
                    msg,
                    hostname=server,
                    port=port,
                    use_tls=tls,
                    start_tls=starttls
                )
            return None

        except Exception:
            print(traceback.print_exc())
            raise Exception("Error while sending email")
