# -*- coding: utf-8 -*-
from bms.v1.handlers import Viewer
from bms.v1.borehole.identifier import (
    ListIdentifiers
)


class IdentifierViewerHandler(Viewer):
    async def execute(self, request):
        action = request.pop('action', None)

        if action in ['LIST']:

            async with self.pool.acquire() as conn:

                exe = None

                # request['user'] = self.user

                if action == 'LIST':
                    exe = ListIdentifiers(conn)

                request.pop('lang', None)

                if exe is not None:
                    return (
                        await exe.execute(**request)
                    )

        raise Exception("Identifier action '%s' unknown" % action)
