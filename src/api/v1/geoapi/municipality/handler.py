# -*- coding: utf-8 -*-
from bms.v1.handlers import Viewer
from bms.v1.geoapi import (
    ListMunicipality,
    GetMunicipality
)


class MunicipalityHandler(Viewer):

    async def execute(self, request):
        action = request.pop('action', None)

        if action in [
                'LIST', 'GET']:

            async with self.pool.acquire() as conn:

                exe = None
                if action == 'LIST':
                    exe = ListMunicipality(conn)

                elif action == 'GET':
                    exe = GetMunicipality(conn)

                request.pop('lang', None)

                if exe is not None:
                    return (
                        await exe.execute(**request)
                    )

        raise Exception("Action '%s' unknown" % action)
