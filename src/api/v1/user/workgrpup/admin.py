# -*- coding: utf-8 -*-
from bms import (
    AuthorizationException
)
from bms.v1.handlers.admin import Admin
from bms.v1.user.workgrpup import (
    CreateWorkgroup,
    DeleteWorkgroup,
    DisableWorkgroup,
    EnableWorkgroup,
    ListWorkgroups,
    ListSuppliers,
    CreateWorkgroup,
    SetRole,
    UpdateWorkgroup
)


class WorkgroupAdminHandler(Admin):
    async def execute(self, request):

        action = request.pop('action', None)

        if action in [
            'CREATE',
            'DISABLE',
            'DELETE',
            'ENABLE',
            'LIST',
            'LIST_SUPPLIERS',
            'SET',
            'UPDATE'
        ]:

            async with self.pool.acquire() as conn:

                exe = None

                if action in [
                    'CREATE',
                    'DELETE',
                    'DISABLE',
                    'ENABLE',
                    'LIST',
                    'SET',
                    'UPDATE'
                ]:
                    if self.user['admin'] is False: 
                        raise AuthorizationException() 

                if action == 'LIST':
                    exe = ListWorkgroups(conn)

                elif action == 'LIST_SUPPLIERS':
                    exe = ListSuppliers(conn)

                elif action == 'CREATE':
                    exe = CreateWorkgroup(conn)

                elif action == 'SET':
                    exe = SetRole(conn)

                elif action == 'DISABLE':
                    exe = DisableWorkgroup(conn)

                elif action == 'ENABLE':
                    exe = EnableWorkgroup(conn)

                elif action == 'DELETE':
                    exe = DeleteWorkgroup(conn)

                elif action == 'UPDATE':
                    exe = UpdateWorkgroup(conn)

                if exe is not None:
                    return (
                        await exe.execute(**request)
                    )

        raise Exception("Action '%s' unknown" % action)
