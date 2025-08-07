# -*- coding: utf-8 -*-
from bms.v1.handlers import Producer
from bms.v1.borehole.stratigraphy.layer import (
    CreateLayer,
    PatchLayer,
    DeleteLayer,
    GapLayer
)


class LayerProducerHandler(Producer):
    async def execute(self, request):
        action = request.pop('action', None)

        if action in [
            'CREATE',
            'DELETE',
            'GAP',
            'PATCH'
        ]:

            async with self.pool.acquire() as conn:
                async with conn.transaction():

                    exe = None

                    # Lock check
                    if action in [
                        'CREATE',
                    ]:
                        sql = """
                            SELECT
                                id_bho_fk
                            FROM
                                bdms.stratigraphy
                            WHERE
                                id_sty = $1
                        """

                    elif action in [
                        'DELETE',
                        'GAP',
                        'PATCH'
                    ]:
                        sql = """
                            SELECT
                                id_bho_fk
                            FROM
                                bdms.layer
                            INNER JOIN bdms.stratigraphy
                            ON id_sty_fk = id_sty
                            WHERE
                                id_lay = $1
                        """

                    bid = await conn.fetchval(sql, request['id'])


                    if action == 'CREATE':
                        exe = CreateLayer(conn)
                        request['user_id'] = self.user['id']

                    elif action == 'DELETE':
                        exe = DeleteLayer(conn)
                        request['user_id'] = self.user['id']

                    elif action == 'GAP':
                        exe = GapLayer(conn)
                        request['user_id'] = self.user['id']

                    elif action == 'PATCH':
                        exe = PatchLayer(conn)
                        request['user_id'] = self.user['id']

                    request.pop('lang', None)

                    if exe is not None:
                        return (
                            await exe.execute(**request)
                        )

        raise Exception("Layer action '%s' unknown" % action)
