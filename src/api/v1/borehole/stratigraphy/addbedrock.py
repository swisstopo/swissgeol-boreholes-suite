# -*- coding: utf-8 -*-
from bms.v1.action import Action


class AddBedrock(Action):

    async def execute(self, id, user_id):

        bedrock = await self.conn.fetchrow("""
            SELECT
                b.id_bho,
                b.top_bedrock_bho,
                b.chronostrat_id_cli,
                b.lithology_top_bedrock_id_cli,
                b.lithostrat_id_cli
            FROM
                bdms.stratigraphy as s,
                bdms.borehole as b
            WHERE
                s.id_sty = $1
            AND
                s.id_bho_fk = b.id_bho
        """, id)

        if bedrock is None:
            raise Exception("Borehole not found")

        elif bedrock[1] is None:
            raise Exception("Bedrock not yet defined")

        return {
            "id": (
                await self.conn.fetchval("""
                    INSERT INTO bdms.layer(
                        id_sty_fk, creator_lay, updater_lay,
                        depth_from_lay,
                        chronostratigraphy_id_cli,
                        lithology_top_bedrock_id_cli,
                        lithostratigraphy_id_cli,
                        last_lay
                    )
                    VALUES (
                        $1, $2, $3, $4, $5, $6, $7, False
                    )
                    RETURNING
                        id_lay
                """,
                    id, user_id, user_id,
                    bedrock[1],
                    bedrock[2],
                    bedrock[3],
                    bedrock[4]
                )
            )
        }
