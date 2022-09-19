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

                mentions = []
                if field is not None:
                    for field_name in fields:
                        if value.find(f'({field_name}') > -1:
                            mentions.append(field_name)

                id_bho = await self.conn.fetchval(f"""
                    UPDATE bdms.workflow
                    SET
                        {column} = $1,
                        mentions_wkf = $2,
                        id_usr_fk = $3
                    WHERE id_wkf = $4
                    RETURNING id_bho_fk;
                """, value, mentions, user['id'], id)

                await self.conn.execute("""
                    UPDATE bdms.borehole
                    SET
                        updated_bho = now(),
                        updated_by_bho = $1
                    WHERE id_bho = $2
                """, user['id'], id_bho)

            return {
                "data": {
                    "id": id,
                    "mentions": mentions
                }
            }

        except PatchAttributeException as bmsx:
            raise bmsx

        except Locked as lkd:
            raise lkd

        except Exception:
            raise Exception("Error while updating borehole")
