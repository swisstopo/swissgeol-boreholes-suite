# -*- coding: utf-8 -*-
import traceback
from bms import (
    # Locked,
    # EDIT,
    AuthenticationException,
    AuthorizationException,
    WorkgroupFreezed,
    MissingParameter,
    BmsException
)
from bms.v1.handlers import Producer
from bms.v1.borehole import (
    StartEditing,
    Lock,
    Unlock,
    DeleteBorehole,
    DeleteBoreholes,
    ListEditingBorehole,
    MultiPatchBorehole,
    PatchBorehole,
    BoreholeIds,
    EditingListFilesBorehole
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
            'COPY',
            'LOCK',
            'UNLOCK',
            'EDIT',
            'DELETE',
            'DELETELIST',
            'PATCH',
            'MULTIPATCH',
            'CHECK',
            'LIST',
            'IDS',
            'LISTFILES'
        ]:

            async with self.pool.acquire() as conn:

                exe = None

                # Check concurrent lock if an editing action requested for an
                #  exisitng element
                if action in [
                    'LOCK',
                    'UNLOCK',
                    'EDIT',
                    'DELETE',
                    'PATCH',
                ]:

                    if (
                        action in [
                            'CHECK',
                            'PATCH',
                        ]
                    ):
                        # add auth exception
                        await self.check_edit(
                            request['id'], self.user, conn
                        )
                        if res['role'] != 'EDIT':
                            raise AuthorizationException()

                if (
                    action in [
                        'COPY',
                    ]
                ):
                    # Check if Workgroup is not freezed
                    for w in self.user['workgroups']:
                        if w['id'] == request['workgroup']:

                            if w['disabled'] is not None:
                                raise WorkgroupFreezed()

                            elif 'EDIT' not in w['roles']:
                                raise AuthorizationException()



                if action == 'LOCK':
                    exe = Lock(conn)
                    request['user'] = self.user

                elif action == 'UNLOCK':
                    exe = Unlock(conn)

                elif action == 'EDIT':
                    exe = StartEditing(conn)
                    request['user'] = self.user

                elif action == 'DELETE':
                    exe = DeleteBorehole(conn)

                elif action == 'DELETELIST':
                    exe = DeleteBoreholes(conn)

                elif action == 'PATCH':
                    exe = PatchBorehole(conn)
                    request['user'] = self.user

                elif action == 'MULTIPATCH':
                    exe = MultiPatchBorehole(conn)
                    request['user'] = self.user

                elif action == 'IDS':
                    exe = BoreholeIds(conn)
                    request['user'] = self.user

                elif action == 'LISTFILES':
                    exe = EditingListFilesBorehole(conn)
                    request['user'] = self.user

                elif action == 'LIST':
                    exe = ListEditingBorehole(conn)
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

                if exe is not None:
                    return (
                        await exe.execute(**request)
                    )

        raise Exception("Action '%s' unknown" % action)
