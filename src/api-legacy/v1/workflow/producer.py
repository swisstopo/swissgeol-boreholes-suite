# -*- coding: utf-8 -*-
from bms import (
    Locked,
    EDIT,
    AuthorizationException
)
from bms.v1.handlers import Producer
from bms.v1.workflow import (
    ListWorkflows,
    PatchWorkflow,
    SubmitWorkflow,
    RejectWorkflow,
    ResetWorkflow
)


class WorkflowProducerHandler(Producer):

    async def execute(self, request):
        action = request.pop('action', None)

        if action in ['LIST', 'PATCH', 'SUBMIT', 'REJECT', 'RESET']:

            async with self.pool.acquire() as conn:
                async with conn.transaction():

                    exe = None
                    id_bho = None

                    if action in [
                        'PATCH', 'SUBMIT', 'REJECT', 'RESET'
                    ]:
                        # Get Borehole id
                        id_bho = await conn.fetchval("""
                            SELECT
                                id_bho_fk
                            FROM
                                bdms.workflow
                            WHERE
                                id_wkf = $1;
                        """, request['id'])

                        # Lock check
                        await self.check_lock(
                            id_bho, self.user, conn
                        )

                    if action == 'LIST':
                        exe = ListWorkflows(conn)

                    elif action == 'PATCH':
                        exe = PatchWorkflow(conn)
                        request['user'] = self.user

                    elif action == 'SUBMIT':
                        exe = SubmitWorkflow(conn)
                        request['user'] = self.user
                        request['bid'] = id_bho

                    elif action == 'REJECT':
                        exe = RejectWorkflow(conn)
                        request['user'] = self.user
                        request['bid'] = id_bho

                    elif action == 'RESET':
                        exe = ResetWorkflow(conn)
                        request['user'] = self.user
                        request['bid'] = id_bho

                    request.pop('lang', None)

                    if exe is not None:
                        return (
                            await exe.execute(**request)
                    )

        raise Exception("Action '%s' unknown" % action)
