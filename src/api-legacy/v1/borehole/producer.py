# -*- coding: utf-8 -*-
import traceback
from bms import (
    AuthenticationException,
    BmsException
)
from bms.v1.handlers import Producer
from bms.v1.borehole import (
    DeleteBorehole,
    DeleteBoreholes,
    MultiPatchBorehole,
    PatchBorehole,
)
from bms.v1.setting import (
    PatchSetting
)


class BoreholeProducerHandler(Producer):

    async def post(self, *args, **kwargs):
        if (
            'Content-Type' in self.request.headers and
            'multipart/form-data' in self.request.headers['Content-Type']
        ):
            try:
                self.set_header("Content-Type", "application/json; charset=utf-8")
                if self.user is None:
                    raise AuthenticationException()

                self.authorize()

            except BmsException as bex:
                print(traceback.print_exc())
                self.write({
                    "success": False,
                    "message": str(bex),
                    "error": bex.code,
                    "data": bex.data
                })

            except Exception as ex:
                print(traceback.print_exc())
                self.write({
                    "success": False,
                    "message": str(ex)
                })

            self.finish()

        else:
            await super(
                BoreholeProducerHandler, self
            ).post(*args, **kwargs)

    async def execute(self, request):
        action = request.pop('action', None)

        if action in [
            'DELETELIST',
            'MULTIPATCH',
        ]:

            async with self.pool.acquire() as conn:

                exe = None

                if action == 'DELETELIST':
                    exe = DeleteBoreholes(conn)

                elif action == 'MULTIPATCH':
                    exe = MultiPatchBorehole(conn)
                    request['user'] = self.user

                    # update only if ordering changed
                    if 'orderby' in request and (
                        request['orderby'] is not None
                    ) and (
                        'orderby' in self.user['setting']['eboreholetable'] and
                        ('orderby' not in self.user['setting']['eboreholetable'] or
                        self.user['setting']['eboreholetable']['orderby'] != request['orderby'])
                    ):
                        await (PatchSetting(conn)).execute(
                            self.user['id'],
                            'eboreholetable.orderby',
                            request['orderby']
                        )
                    else:
                        if 'orderby' in self.user['setting']['eboreholetable']:
                            request['orderby'] = self.user[
                                'setting'
                            ]['eboreholetable']['orderby']

                    if 'direction' in request and (
                        request['direction'] is not None
                    ) and (
                        ('direction' not in self.user['setting']['eboreholetable'] or
                        self.user['setting']['eboreholetable']['direction'] != request['direction'])
                    ):
                        await (PatchSetting(conn)).execute(
                            self.user['id'],
                            'eboreholetable.direction',
                            request['direction']
                        )
                    else:
                        request['direction'] = self.user[
                            'setting'
                        ]['eboreholetable']['direction']

                request.pop('lang', None)
                request.pop('orderby', None)
                request.pop('direction', None)

                if exe is not None:
                    return (
                        await exe.execute(**request)
                    )

        raise Exception("Action '%s' unknown" % action)
