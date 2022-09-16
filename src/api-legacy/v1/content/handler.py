# -*- coding: utf-8 -*-
from bms.v1.handlers import Viewer
from bms.v1.content import (
    GetContent
)
import json


class ContentHandler(Viewer):

    async def prepare(self):
        pass

    async def get(self, name):
        self.set_header("Content-Type", "application/javascript; charset=UTF-8")
        async with self.pool.acquire() as conn:
            exe = GetContent(conn)
            data = await exe.execute(name)

            self.write(f'window.{name}Content = {json.dumps(data["data"])}')
            self.finish()

    async def execute(self, request):
        action = request.pop('action', None)

        if action in [
            'GET',
        ]:

            async with self.pool.acquire() as conn:

                # request.pop('lang', None)

                exe = None

                if action == 'GET':
                    exe = GetContent(conn)

                if exe is not None:
                    return (
                        await exe.execute(**request)
                    )

        raise Exception("Action '%s' unknown" % action)
