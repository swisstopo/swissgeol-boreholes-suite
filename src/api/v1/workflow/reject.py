# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms import (
    EDIT,
    PUBLIC
)
from bms.v1.borehole import Unlock
from bms.v1.workflow import ListWorkflows
from bms.v1.workflow import CreateWorkflow


class RejectWorkflow(Action):

    async def execute(self, id, user, bid = None):
        try:

            if bid is None:
                bid = await self.conn.fetchval("""
                    SELECT
                        id_bho_fk,
                        id_rol_fk
                    FROM
                        bdms.workflow
                    WHERE
                        id_wkf = $1;
                """, id)

            # Get current workflows
            listWorkflows = ListWorkflows(self.conn)
            workflows = await listWorkflows.execute(bid)

            # Check that requested workflow is the last and open
            if len(workflows['data']) == 0:
                raise Exception("Workflow list empty")

            current = workflows['data'][-1]
            if current['id'] != id:
                raise Exception("Rejecting wrong workflow")

            id_rol = await self.conn.fetchval("""
                UPDATE bdms.workflow
                SET
                    finished_wkf = now(),
                    id_usr_fk = $1
                WHERE id_wkf = $2
                RETURNING id_rol_fk;
            """, user['id'], id)

            if (id_rol > EDIT):
                await (
                    CreateWorkflow(self.conn)
                ).execute(
                    bid,
                    user,
                    (id_rol - 1)
                )

                # When rejected from the PUBLIC state and was
                # published online, then un-publish the borehole
                if id_rol == PUBLIC:
                    await self.conn.fetchval("""
                        UPDATE
                            bdms.borehole
                        SET
                            public_bho = FALSE
                        WHERE id_bho = $1;
                    """, bid)

            # Finaly stop editing
            await (
                Unlock(self.conn)
            ).execute(
                bid
            )

            return (
                await listWorkflows.execute(bid)
            )

        except Exception:
            raise Exception("Error while updating borehole")
