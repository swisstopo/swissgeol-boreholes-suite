# -*- coding: utf-8 -*-
from bms import (
    AuthorizationException
)
from bms.v1.handlers.admin import Admin
from bms.v1.borehole.identifier import (
    CreateIdentifier,
    DeleteIdentifier,
    PatchIdentifier
)


class IdentifierAdminHandler(Admin):
    async def execute(self, request):

        action = request.pop('action', None)

        if action in [
            'CREATE',
            'DELETE',
            'UPDATE'
        ]:

            async with self.pool.acquire() as conn:

                exe = None

                if action == 'CREATE':
                    exe = CreateIdentifier(conn)

                elif action == 'DELETE':
                    exe = DeleteIdentifier(conn)

                elif action == 'UPDATE':
                    exe = PatchIdentifier(conn)

                if exe is not None:
                    return (
                        await exe.execute(**request)
                    )

        raise Exception("Action '%s' unknown" % action)
