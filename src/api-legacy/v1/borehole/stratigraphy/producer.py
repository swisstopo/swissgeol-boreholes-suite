# -*- coding: utf-8 -*-
from bms.v1.handlers import Producer
from bms.v1.borehole.stratigraphy import (
    AddBedrock,
    CreateStratigraphy,
    DeleteStratigraphy
)


class StratigraphyProducerHandler(Producer):
    async def execute(self, request):
        action = request.pop('action', None)

        if action in [
            'ADDBEDROCK',
            'CHECK',
            'CREATE',
            'DELETE'
        ]:

            async with self.pool.acquire() as conn:

                exe = None

                id_bho = None

                if action in [
                    'CREATE'
                ]:
                    # Lock check
                    await self.check_lock(
                        request['id'], self.user, conn
                    )

                elif action in [
                    'ADDBEDROCK',
                    'CHECK',
                    'DELETE'
                ]:
                    # Get Borehole id
                    id_bho = await conn.fetchval("""
                        SELECT
                            id_bho_fk
                        FROM
                            bdms.stratigraphy
                        WHERE
                            id_sty = $1;
                    """, request['id'])

                    # Lock check
                    await self.check_lock(
                        id_bho, self.user, conn
                    )

                if action == 'ADDBEDROCK':
                    exe = AddBedrock(conn)
                    request['user_id'] = self.user['id']

                elif action == 'CREATE':
                    exe = CreateStratigraphy(conn)
                    request['user_id'] = self.user['id']

                elif action == 'DELETE':
                    exe = DeleteStratigraphy(conn)
                    request['user_id'] = self.user['id']

                request.pop('lang', None)

                if exe is not None:
                    return (
                        await exe.execute(**request)
                    )

        raise Exception("Action '%s' unknown" % action)
