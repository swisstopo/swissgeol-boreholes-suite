# -*- coding: utf-8 -*-
from bms.v1.action import Action
from .list import ListLayers
from .patch import PatchLayer
from .create import CreateLayer
from .get import GetLayer
from bms.v1.exceptions import (
    ActionWrong,
    NotFound
)


class GapLayer(Action):

    async def execute(self, id, user_id, then = 0, value = None):

        # Get borehole id
        id_sty = await self.conn.fetchval("""
            SELECT
                id_sty_fk
            FROM
                bdms.layer
            WHERE
                id_lay = $1
        """, id)

        # Get all layers
        layers = await (
            ListLayers(self.conn)
        ).execute(id_sty)

        patch = PatchLayer(self.conn)

        cnt = len(layers['data'])

        for index in range(0, cnt):

            layer = layers['data'][index]

            if layer['id'] == id:

                upper = None

                if index > 0:
                    upper = layers['data'][(index-1)]

                if then == 0:  # Fill with undefined

                    undefined = await (
                        CreateLayer(self.conn)
                    ).execute(id_sty, user_id)

                    if upper == None and index == 0:
                        await patch.execute(
                            undefined['id'], 'depth_from', 0, user_id
                        )
                        await patch.execute(
                            undefined['id'], 'depth_to',
                            layer['depth_from'], user_id
                        )

                    else:
                        await patch.execute(
                            undefined['id'], 'depth_from',
                            upper['depth_to'], user_id
                        )
                        await patch.execute(
                            undefined['id'], 'depth_to',
                            layer['depth_from'], user_id
                        )


                    await patch.execute(
                        undefined['id'], 'lithology',
                        (
                            await self.conn.fetchval("""
                                SELECT
                                    id_cli
                                FROM
                                    bdms.codelist
                                WHERE
                                    code_cli = $1
                                AND
                                    schema_cli = 'custom.lithology_top_bedrock'
                            """, 'unknown')
                        ), user_id
                    )

                elif then == 1:  # Extend upper layer to bottom

                    if upper == None:
                        raise ActionWrong()

                    await patch.execute(
                        upper['id'],
                        'depth_to',
                        layer['depth_from'],
                        user_id
                    )

                elif then == 2:  # Extend lower layer to top

                    if upper == None and index == 0:
                        await patch.execute(
                            layer['id'],
                            'depth_from',
                            0,
                            user_id
                        )

                    else:
                        await patch.execute(
                            layer['id'],
                            'depth_from',
                            upper['depth_to'],
                            user_id
                        )

                break
