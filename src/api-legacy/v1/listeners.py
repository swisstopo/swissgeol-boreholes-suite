# -*- coding: utf-8 -*-

import asyncio
import json
from tornado.options import options
from bms.v1.feedback import ForwardFeedback
import traceback

class EventListener():

    actions = [
        'FEEDBACK.CREATE'
    ]

    def __init__(self, application):
        self.application = application
        self.conn = None
    
    async def start(self):
        if self.conn is None:
            self.conn = await self.application.pool.acquire()

        for action in self.actions:
            await self.conn.add_listener(action, self.callback)

    async def stop(self):
        for action in self.actions:
            await self.conn.remove_listener(action, self.callback)

        await self.conn.close()

    async def handleCallback(self, action, payload):

        exe = None
        request = {}

        try:

            id = int(payload)

            if action == 'FEEDBACK.CREATE':
                exe = ForwardFeedback(self.conn)

                # Prepare request
                request = {
                    "feb_id": id,
                    "sender": options.smtp_sender,
                    "password": options.smtp_password,
                    "recipients": options.smtp_recipients,
                    "server": options.smtp_server,
                    "port": options.smtp_port,
                    "tls": options.smtp_tls,
                    "starttls": options.smtp_starttls,
                }

            else:
                print(f"Action unknown: {action}")

            if exe is not None:
                print("Running async task..")
                response = await exe.execute(**request)

        except Exception as ex:
            print(traceback.print_exc())

    def callback(self, conn, pid, action, payload):

        if action in self.actions:

            asyncio.create_task(
                self.handleCallback(action, payload)
            )

        else:
            print(f"Unknown event action: {action}")
