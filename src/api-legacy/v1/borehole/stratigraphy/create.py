# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.exceptions import DuplicateException


class CreateStratigraphy(Action):

    async def execute(self, id, user_id, kind=None):
        try:
            await self.conn.execute("BEGIN;")

            if kind is None:
                # find default stratigraphy type
                kind = await self.conn.fetchval("""
                    SELECT
                        id_cli
                    FROM
                        bdms.codelist
                    WHERE
                        schema_cli = 'layer_kind'
                    AND
                        default_cli IS TRUE
                """)

            # Check if this is the first inserted stratigraphy
            # if assertion is true, then set as primary
            cnt = await self.conn.fetchval("""
                SELECT
                    count(id_sty)
                FROM
                    bdms.stratigraphy
                WHERE
                    id_bho_fk = $1
                AND
                    kind_id_cli = $2
            """, id, kind)

            primary_sty = True if cnt == 0 else False

            if int(kind) == 3003 and cnt>1:
                # Only one instrument profile per borehole !
                raise DuplicateException()

            # Insert the new stratigraphy
            id_sty = await self.conn.fetchval("""
                INSERT INTO bdms.stratigraphy(
                    id_bho_fk, primary_sty, author_sty, kind_id_cli
                )
                VALUES ($1, $2, $3, $4) RETURNING id_sty
            """, id, primary_sty, user_id, kind)

            await self.conn.execute("COMMIT;")

            return {
                "id": id_sty
            }

        except Exception as ex:
            await self.conn.execute("ROLLBACK;")
            raise ex
