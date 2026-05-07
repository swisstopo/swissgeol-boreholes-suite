# -*- coding: utf-8 -*-
import asyncio
import json


class Action():

    lock_timeout = 60

    def __init__(self, conn=None, pool=None):
        self.conn = conn
        self.pool = pool
        self.idx = 0

    def decode(self, text, nullValue=None):
        if text is None:
            return nullValue
        return json.loads(text)

    def run_until_complete(self, tasks):
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(
            asyncio.wait(
                [loop.create_task(x) for x in tasks]
            )
        )

    async def execute(self, *arg, **args):
        pass

    def getIdx(self):
        self.idx += 1
        return "$%s" % self.idx
