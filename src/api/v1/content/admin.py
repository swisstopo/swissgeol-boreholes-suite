# -*- coding: utf-8 -*-
from bms.v1.handlers.admin import Admin
from bms.v1.content import (
    DraftContent,
    GetContentDraft,
    PublishContent,
)


class ContentAdminHandler(Admin):
    async def execute(self, request):
        action = request.pop('action', None)

        if action in [
            'DRAFT',
            'GET',
            'PUBLISH'
        ]:

            async with self.pool.acquire() as conn:

                exe = None

                if action == 'DRAFT':
                    exe = DraftContent(conn)

                elif action == 'GET':
                    exe = GetContentDraft(conn)

                elif action == 'PUBLISH':
                    exe = PublishContent(conn)

                if exe is not None:
                    return (
                        await exe.execute(**request)
                    )

        raise Exception("Action '%s' unknown" % action)
