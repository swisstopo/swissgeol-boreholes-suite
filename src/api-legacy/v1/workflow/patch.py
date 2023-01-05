# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.exceptions import (
    PatchAttributeException
)
from bms import Locked


class PatchWorkflow(Action):

    async def execute(self, id, field, value, user):
        try:
            # Updating character varing, boolean fields
            if field in ['notes']:

                column = None

                if field == 'notes':
                    column = 'notes_wkf'

                fields = await self.conn.fetchval("""
                    SELECT
                        array_agg(code_cli)
                    FROM
                        bdms.codelist
                    WHERE
                        schema_cli = 'borehole_form'
                """)

                id_bho = await self.conn.fetchval(f"""
                    UPDATE bdms.workflow
                    SET
                        {column} = $1,
                        id_usr_fk = $2
                    WHERE id_wkf = $3
                    RETURNING id_bho_fk;
                """, value, user['id'], id)

                await self.conn.execute("""
                    UPDATE bdms.borehole
                    SET
                        updated_bho = now(),
                        updated_by_bho = $1
                    WHERE id_bho = $2
                """, user['id'], id_bho)

            return {
                "data": {
                    "id": id
                }
            }

        except PatchAttributeException as bmsx:
            raise bmsx

        except Locked as lkd:
            raise lkd

        except Exception:
            raise Exception("Error while updating borehole")
