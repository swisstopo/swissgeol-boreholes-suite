# -*- coding: utf-8 -*-
from bms.v1.handlers import Viewer
from bms.v1.borehole.stratigraphy.layer import (
    CreateLayer,
    ListLayers,
    GetLayer,
    PatchLayer,
    DeleteLayer
)


class LayerViewerHandler(Viewer):
    async def execute(self, request):
        action = request.pop('action', None)

        if action in [
                'LIST',
                'GET']:

            async with self.pool.acquire() as conn:

                exe = None

                request['user'] = self.user

                if action == 'GET':
                    exe = GetLayer(conn)

                elif action == 'LIST':
                    exe = ListLayers(conn)

                request.pop('lang', None)

                if exe is not None:
                    return (
                        await exe.execute(**request)
                    )

        raise Exception("Layer action '%s' unknown" % action)
