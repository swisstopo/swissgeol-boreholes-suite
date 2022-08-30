# -*- coding: utf-8 -*-
from bms.v1.handlers import Viewer
from bms.v1.geoapi import (
    ListCanton
)


class CantonHandler(Viewer):
    async def execute(self, request):
        action = request.pop('action', None)

        if action in [
                'LIST']:

            async with self.pool.acquire() as conn:

                exe = None

                if action == 'LIST':
                    exe = ListCanton(conn)

                request.pop('lang', None)

                if exe is not None:
                    return (
                        await exe.execute(**request)
                    )

        raise Exception("Action '%s' unknown" % action)
