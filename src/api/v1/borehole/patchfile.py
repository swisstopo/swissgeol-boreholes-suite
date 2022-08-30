# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.exceptions import (
    PatchAttributeException
)
from bms import Locked
from datetime import datetime
from datetime import timedelta


class PatchFile(Action):

    async def execute(self, id, fid, field, value, user):
        try:
            
            # Updating character varing, boolean fields
            if field in [
                'public',
                'description'
            ]:

                column = None

                if field == 'description':
                    column = 'description_bfi'

                elif field == 'public':
                    column = 'public_bfi'

                if column is not None:

                    await self.conn.execute(
                        f"""
                            UPDATE bdms.borehole_files
                            SET
                                {column} = $1,
                                update_bfi = now(),
                                updater_bfi = $2
                            WHERE
                                id_bho_fk = $3
                            AND
                                id_fil_fk = $4
                        """, value, user['id'], id, fid)

                    return

            raise PatchAttributeException(field)

        except PatchAttributeException as bmsx:
            raise bmsx

        except Locked as lkd:
            raise lkd

        except Exception:
            raise Exception("Error while updating borehole")
