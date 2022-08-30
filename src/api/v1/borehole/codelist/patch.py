# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.exceptions import (
    PatchAttributeException
)
from bms.v1.borehole.geom.patch import PatchGeom
import json


class PatchCode(Action):

    async def execute(self, code_id, tree, value, key=None):

        # Check if tree parameter is a List
        if isinstance(tree, list):
            result = None

            # for each element in the list call the execute method
            for element in tree:
                result = await self.execute(code_id, element, value, key)

            return result

        else:
                
            try:
                # Updating character varing, boolean fields
                pathList = tree.split('.')
                l = len(pathList)

                if key is not None:
                    l += 1
                    pathList.append(key)

                rec = await self.conn.fetchrow("""
                    SELECT
                        conf_cli,
                        schema_cli
                    FROM
                        bdms.codelist
                    WHERE
                        id_cli = $1
                """, code_id)

                setting = (
                    self.decode(rec[0])
                    if rec[0] is not None and rec[0] != ''
                    else None
                )
                tmp = setting

                if tmp is not None:
                    for idx in range(0, l):
                        if idx < (l-1) and pathList[idx] not in tmp:
                            tmp[pathList[idx]] = {}

                        elif idx == (l-1):
                            if value is None:
                                del tmp[pathList[idx]]
                                break

                            else:
                                tmp[pathList[idx]] = value

                        tmp = tmp[pathList[idx]]

                else:
                    setting = {}
                    tmp = setting
                    for idx in range(0, l):
                        if idx < (l-1):
                            tmp[pathList[idx]] = {}

                        else:
                            if value is None:
                                del tmp[pathList[idx]]
                                break

                            else:
                                tmp[pathList[idx]] = value
                        tmp = tmp[pathList[idx]]

                await self.conn.execute("""
                    UPDATE bdms.codelist
                    SET
                        conf_cli = $1
                    WHERE
                        id_cli = $2
                """, json.dumps(setting), code_id)

                return {
                    "data": setting,
                    "code_id": code_id,
                    "schema": rec[1]
                }

            except PatchAttributeException as bmsx:
                raise bmsx

            except Exception:
                raise Exception("Error while updating borehole")
