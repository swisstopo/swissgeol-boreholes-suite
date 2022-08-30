# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.borehole.geom.patch import PatchGeom
import json


class AcceptTerms(Action):

    async def execute(self, user_id, id_tes):
        # Guets user accepting
        if user_id == 0:
            return None

        try:
            # Check if already accepted
            rec = await self.conn.fetchrow("""
                SELECT
                    id_usr_fk,
                    accepted_tea
                FROM
                    bdms.terms_accepted
                WHERE
                    id_tes_fk = $1
            """, id_tes)

            if rec is None:
                # Accepted Terms flag
                await self.conn.execute("""
                    INSERT INTO bdms.terms_accepted (
                        id_usr_fk, id_tes_fk
                    ) VALUES (
                        $1, $2
                    )
                """, user_id, id_tes)

            return None

        except Exception:
            raise Exception("Error while accepting terms")
