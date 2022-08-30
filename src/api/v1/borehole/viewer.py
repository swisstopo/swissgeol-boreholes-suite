# -*- coding: utf-8 -*-
from bms.v1.handlers import Viewer
from bms.v1.borehole import (
    ListBorehole,
    ListFilesBorehole,
    GetBorehole,
    ListGeojson
)
from bms.v1.setting import (
    PatchSetting
)


class BoreholeViewerHandler(Viewer):
    async def execute(self, request):
        action = request.pop('action', None)

        if action in [
            'LIST',
            'LISTFILES',
            'GET',
            'GEOJSON',
        ]:

            async with self.pool.acquire() as conn:

                exe = None

                request['user'] = self.user

                if action == 'LIST':
                    exe = ListBorehole(conn)

                    if self.user['id'] != 0:

                        # update only if ordering changed
                        if 'orderby' in request and (
                            request['orderby'] is not None
                        ) and (
                            self.user[
                                'setting'
                            ]['boreholetable']['orderby'] != request['orderby']
                        ):
                            await (PatchSetting(conn)).execute(
                                self.user['id'],
                                'boreholetable.orderby',
                                request['orderby']
                            )

                        else:
                            request['orderby'] = self.user[
                                'setting'
                            ]['boreholetable']['orderby']

                        if 'direction' in request and (
                            request['direction'] is not None
                        ) and (
                            self.user[
                                'setting'
                            ]['boreholetable']['direction'] != request['direction']
                        ):
                            await (PatchSetting(conn)).execute(
                                self.user['id'],
                                'boreholetable.direction',
                                request['direction']
                            )

                        else:
                            request['direction'] = self.user[
                                'setting'
                            ]['boreholetable']['direction']

                elif action == 'LISTFILES':
                    exe = ListFilesBorehole(conn)

                elif action == 'GET':
                    exe = GetBorehole(conn)

                elif action == 'GEOJSON':
                    exe = ListGeojson(conn)

                request.pop('lang', None)

                if exe is not None:
                    return (
                        await exe.execute(**request)
                    )

        raise Exception("Action '%s' unknown" % action)
