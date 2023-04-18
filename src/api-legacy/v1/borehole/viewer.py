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
                        requested_orderby = request.get('orderby')
                        current_orderby = self.user.get('setting', {}).get('boreholetable', {}).get('orderby')

                        if requested_orderby is not None and requested_orderby != current_orderby:
                            await (PatchSetting(conn)).execute(
                                self.user['id'],
                                'boreholetable.orderby',
                                requested_orderby
                            )
                        else:
                            request['orderby'] = current_orderby

                        requested_direction = request.get('direction')
                        current_direction = self.user.get('setting', {}).get('boreholetable', {}).get('direction')

                        if requested_direction is not None and requested_direction != current_direction:
                            await (PatchSetting(conn)).execute(
                                self.user['id'],
                                'boreholetable.direction',
                                requested_direction
                            )
                        else:
                            request['direction'] = current_direction

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
