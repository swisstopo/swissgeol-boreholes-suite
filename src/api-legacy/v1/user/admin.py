# -*- coding: utf-8 -*-
from bms import (
    AuthorizationException
)
from bms.v1.handlers.admin import Admin
from bms.v1.user import (
    CreateUser,
    DeleteUser,
    DisableUser,
    EnableUser,
    UpdateUser
)


class AdminHandler(Admin):
    async def execute(self, request):

        action = request.pop('action', None)

        if action in [
            'CREATE',
            'DISABLE',
            'DELETE',
            'ENABLE',
            'UPDATE'
        ]:

            async with self.pool.acquire() as conn:

                exe = None

                if action in [
                    'CREATE',
                    'DELETE',
                    'DISABLE',
                    'ENABLE',
                    'UPDATE'
                ]:
                    if self.user['admin'] is False: 
                        raise AuthorizationException() 

                    # Admin user cannot remove his own admin flag
                    if (
                        action == 'UPDATE' and
                        self.user['id'] == request['user_id']
                    ):
                        was_admin = await conn.fetchval("""
                            SELECT admin_usr
                            FROM
                                bdms.users
                            WHERE
                                id_usr = $1
                        """, request['user_id'])

                        if was_admin and request['admin'] is False:
                            request['admin'] = True

                if action == 'CREATE':
                    exe = CreateUser(conn)

                elif action == 'UPDATE':
                    exe = UpdateUser(conn)

                elif action == 'DISABLE':
                    exe = DisableUser(conn)

                elif action == 'ENABLE':
                    exe = EnableUser(conn)

                elif action == 'DELETE':
                    exe = DeleteUser(conn)

                if exe is not None:
                    return (
                        await exe.execute(**request)
                    )

        raise Exception("Action '%s' unknown" % action)
