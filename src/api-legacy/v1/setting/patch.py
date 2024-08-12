# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.exceptions import (
    PatchAttributeException
)
from bms.v1.borehole.geom.patch import PatchGeom
import json


class PatchSetting(Action):

    async def execute(self, user_id, tree, value, key=None):

        # Check if tree parameter is a List
        if isinstance(tree, list):
            result = None

            # for each element in the list call the execute method
            for element in tree:
                result = await self.execute(user_id, element, value, key)

            return result

        else:

            try:
                # Updating character varing, boolean fields
                pathList = tree.split('.')
                l = len(pathList)

                if key is not None:
                    if isinstance(key, list):
                        for k in key:
                            l += 1
                            pathList.append(k)
                    else:
                        l += 1
                        pathList.append(key)

                rec = await self.conn.fetchrow("""
                    SELECT
                        settings_usr
                    FROM
                        bdms.users
                    WHERE id_usr = $1
                """, user_id)

                setting = self.decode(rec[0]) if rec[0] is not None else None
                tmp = setting

                # Used when reordering overlays
                goingUp = False
                reordering = (
                    isinstance(key, list) and
                    key[-1] == 'position'
                )
                removingOverlay = (
                    isinstance(key, str) and
                    tree in ['map.explorer', 'map.editor'] and
                    value is None
                )
                deleted = None

                if tmp is not None:
                    for idx in range(0, l):
                        if idx < (l-1) and pathList[idx] not in tmp:
                            tmp[pathList[idx]] = {}
                        elif idx == (l-1):
                            if value is None:
                                deleted = tmp[pathList[idx]]
                                del tmp[pathList[idx]]
                                break
                            else:
                                if (
                                    reordering and
                                    tmp[pathList[idx]] < value
                                ):
                                    goingUp = True

                                tmp[pathList[idx]] = value
                        tmp = tmp[pathList[idx]]

                    # if reordering overlays position
                    if reordering:
                        pathList = tree.split('.')
                        l = len(pathList)
                        tmp = setting
                        for idx in range(0, l):
                            tmp = tmp[pathList[idx]]

                        for Identifier in tmp:
                            layer = tmp[Identifier]
                            if Identifier != key[0] and layer['position'] == value:
                                if goingUp:
                                    layer['position'] -= 1
                                else:
                                    layer['position'] += 1

                    elif removingOverlay and deleted:
                        pathList = tree.split('.')
                        l = len(pathList)
                        tmp = setting

                        for idx in range(0, l):
                            tmp = tmp[pathList[idx]]

                        for Identifier in tmp:
                            layer = tmp[Identifier]
                            if layer['position'] > deleted['position']:
                                layer['position'] -= 1

                else:
                    setting = {
                        "filter": {},
                        "viewerFilter": {},
                        "boreholetable": {
                            "orderby": "original_name",
                            "direction": "ASC"
                        },
                        "eboreholetable": {
                            "orderby": "original_name",
                            "direction": "ASC"
                        },
                        "map": {
                            "explorer": {},
                            "editor": {}
                        },
                        "appearance": {
                            "explorer": 1
                        }
                    }

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
                    UPDATE bdms.users
                    SET
                        settings_usr = $1
                    WHERE id_usr = $2
                """, json.dumps(setting), user_id)

                return {
                    "data": setting
                }

            except PatchAttributeException as bmsx:
                raise bmsx

            except Exception:
                raise Exception("Error while updating borehole")
