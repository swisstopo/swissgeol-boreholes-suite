# -*- coding: utf-8 -*-
from bms.v1.action import Action
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
                    user_id,
                    accepted
                FROM
                    bdms.terms_accepted
                WHERE
                    term_id = $1
            """, id_tes)

            if rec is None:
                # Accepted Terms flag
                await self.conn.execute("""
                    INSERT INTO bdms.terms_accepted (
                        user_id, term_id
                    ) VALUES (
                        $1, $2
                    )
                """, user_id, id_tes)

            return None

        except Exception:
            raise Exception("Error while accepting terms")
