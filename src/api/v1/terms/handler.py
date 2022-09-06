# -*- coding: utf-8 -*-
from bms.v1.handlers import Viewer
from bms.v1.terms import (
    AcceptTerms,
    DraftTerms,
    GetTerms,
    PublishTerms,
)


class TermsHandler(Viewer):
    async def execute(self, request):
        action = request.pop('action', None)

        if action in [
            'ACCEPT',
            'GET',
        ]:

            async with self.pool.acquire() as conn:

                # request.pop('lang', None)

                exe = None

                if action == 'ACCEPT':
                    exe = AcceptTerms(conn)
                    request['user_id'] = self.user['id']

                elif action == 'GET':
                    exe = GetTerms(conn)

                if exe is not None:
                    return (
                        await exe.execute(**request)
                    )

        raise Exception("Action '%s' unknown" % action)
