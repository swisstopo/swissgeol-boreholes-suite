# -*- coding: utf-8 -*-
import json
from bms.v1.handlers import Viewer
from bms.v1.feedback import (
    CreateFeedback
)


class FeedbackHandler(Viewer):
    async def execute(self, request):
        action = request.pop('action', None)

        if action in [
            'CREATE',
        ]:

            async with self.pool.acquire() as conn:

                exe = None

                if action == 'CREATE':
                    exe = CreateFeedback(conn)

                    # Add user parameter to request
                    request['user'] = self.user['username']

                if exe is not None:

                    result = await exe.execute(**request)

                    if action == 'CREATE':
                        # Notify event
                        await conn.execute(f'''
                            NOTIFY "FEEDBACK.CREATE", '{result['data']['feb_id']}'
                        ''')

                    return result

                return None

        raise Exception("Action '%s' unknown" % action)
