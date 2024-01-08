# -*- coding: utf-8 -*-
from bms.v1.borehole.profile.patch import PatchProfile
from bms.v1.handlers import Producer


class ProfileProducerHandler(Producer):
    async def execute(self, request):
        action = request.pop('action', None)

        if action in [
            'PATCH'
        ]:

            async with self.pool.acquire() as conn:

                exe = None

                id_bho = None

                if action in [
                    'PATCH',
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

                if action == 'PATCH':
                    exe = PatchProfile(conn)
                    request['user_id'] = self.user['id']

                request.pop('lang', None)

                if exe is not None:
                    return (
                        await exe.execute(**request)
                    )

        raise Exception("Action '%s' unknown" % action)
