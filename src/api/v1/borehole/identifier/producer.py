# -*- coding: utf-8 -*-
from bms import (
    AuthorizationException
)
from bms.v1.handlers import Producer
from bms.v1.borehole.identifier import (
    AddIdentifier,
    RemoveIdentifier
)


class IdentifierProducerHandler(Producer):
    async def execute(self, request):

        action = request.pop('action', None)

        if action in [
            'ADD',
            'REMOVE'
        ]:

            async with self.pool.acquire() as conn:

                exe = None

                if action in [
                    'ADD',
                    'REMOVE'
                ]:
                    # Lock check
                    await self.check_lock(
                        request['id'], self.user, conn
                    )

                if action == 'ADD':
                    exe = AddIdentifier(conn)

                elif action == 'REMOVE':
                    exe = RemoveIdentifier(conn)

                if exe is not None:
                    return (
                        await exe.execute(**request)
                    )

        raise Exception("Action '%s' unknown" % action)
