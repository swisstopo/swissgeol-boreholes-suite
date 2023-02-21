# -*- coding: utf-8 -*-
from bms import (
    AuthorizationException
)
from bms.v1.handlers import Viewer
from bms.v1.borehole.codelist import (
    ListCodeList,
    PatchCode
)


class CodeListHandler(Viewer):
    async def execute(self, request):
        action = request.pop('action', None)

        if action in [
            'PATCH',
            'LIST'
        ]:

            async with self.pool.acquire() as conn:

                if action == 'LIST':
                    action = ListCodeList(conn=conn)

                elif action == 'PATCH':
                    request['code_id'] =  await conn.fetchval("""
                        SELECT
                            id_cli
                        FROM
                            bdms.codelist
                        WHERE
                            schema_cli = 'layer_kind'
                        AND
                            default_cli IS TRUE
                    """)
                    action = PatchCode(conn=conn)

                request.pop('lang', None)  # removing lang

                if action is not None:
                    return (
                        await action.execute(**request)
                    )

        raise Exception("Action '%s' unknown", action)
