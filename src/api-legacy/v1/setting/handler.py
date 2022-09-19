# -*- coding: utf-8 -*-
from bms.v1.handlers import Viewer
from bms.v1.setting import (
    PatchSetting
)


class SettingHandler(Viewer):
    async def execute(self, request):
        action = request.pop('action', None)

        if action in [
                'GET',
                'PATCH']:

            async with self.pool.acquire() as conn:

                if self.user['id'] == 0:
                    return {
                        "data": self.user['setting']
                    }

                exe = None
                request['user_id'] = self.user['id']

                if action == 'GET':
                    return {
                        "data": self.user['setting']
                    }

                elif action == 'PATCH':
                    exe = PatchSetting(conn)

                request.pop('lang', None)

                if exe is not None:
                    return (
                        await exe.execute(**request)
                    )

        raise Exception("Action '%s' unknown" % action)
