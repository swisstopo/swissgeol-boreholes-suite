# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.exceptions import ActionWrong, NotFound


class CreateLayer(Action):

    async def execute(self, id, user_id):

        # Check if stratigraphy is empty
        cnt = await self.conn.fetchval("""
            SELECT
                count(id_lay)
            FROM
                bdms.layer
            WHERE
                id_sty_fk = $1
        """, id)

        depth_from = 0

        if cnt > 0:

            # Check if bedrock inserted
            bedrock = await self.conn.fetchrow("""
                SELECT
                    depth_from_lay,
                    depth_to_lay
                FROM
                    bdms.layer as l,
                    bdms.stratigraphy as s,
                    bdms.borehole as b
                WHERE
                    s.id_sty = $1
                AND
                    l.id_sty_fk = s.id_sty
                AND
                    s.id_bho_fk = b.id_bho
                AND
                    l.depth_from_lay = b.top_bedrock_fresh_md
                AND
                    b.top_bedrock_fresh_md IS NOT NULL
            """, id)

            # Bedrock is not inserted
            if bedrock is None:

                # Just find the deepest inserted layer
                depth_from = await self.conn.fetchval("""
                    SELECT
                        depth_to_lay
                    FROM
                        bdms.layer
                    WHERE
                        id_sty_fk = $1
                    ORDER BY
                        depth_to_lay DESC NULLS LAST
                    LIMIT 1
                """, id)

            # Only Bedrock is inserted and start from the surface
            elif cnt == 1 and bedrock[0] == 0:

                depth_from = bedrock[1]

            # Bedrock is inserted with some other layers
            elif cnt > 1:

                # Check if there is space over the bedrock
                row = await self.conn.fetchrow("""
                    SELECT
                        depth_to_lay
                    FROM
                        bdms.layer as l,
                        bdms.stratigraphy as s,
                        bdms.borehole as b
                    WHERE
                        id_sty_fk = $1
                    AND
                        l.id_sty_fk = s.id_sty
                    AND
                        s.id_bho_fk = b.id_bho
                    AND
                        depth_to_lay <= top_bedrock_fresh_md
                    ORDER BY
                        depth_to_lay DESC NULLS LAST
                    LIMIT 1
                """, id)

                # space found
                if row is not None and row[0] < bedrock[0]:
                    depth_from = row[0]

                # There are some layers but not over the bedrock
                elif row is None and bedrock[0] > 0:
                    depth_from = 0

                # Space not present
                else:

                    # Find the last layer below the bedrock top
                    row = await self.conn.fetchrow("""
                        SELECT
                            depth_to_lay
                        FROM
                            bdms.layer as l,
                            bdms.stratigraphy as s,
                            bdms.borehole as b
                        WHERE
                            id_sty_fk = $1
                        AND
                            l.id_sty_fk = s.id_sty
                        AND
                            s.id_bho_fk = b.id_bho
                        AND
                            depth_to_lay >= top_bedrock_fresh_md
                        ORDER BY
                            depth_to_lay DESC
                        LIMIT 1
                    """, id)

                    if row is not None:
                        depth_from = row[0]

        elif cnt > 0:
            # Just find the deepest inserted layer
            depth_from = await self.conn.fetchval("""
                SELECT
                    depth_to_lay
                FROM
                    bdms.layer
                WHERE
                    id_sty_fk = $1
                ORDER BY
                    depth_to_lay DESC NULLS LAST
                LIMIT 1
            """, id)

        return {
            "id": (
                await self.conn.fetchval("""
                    INSERT INTO bdms.layer(
                        id_sty_fk, creator_lay,
                        updater_lay, depth_from_lay, depth_to_lay,
                        last_lay
                    )
                    VALUES ($1, $2, $3, $4, NULL, False) RETURNING id_lay
                """, id, user_id, user_id, depth_from)
            )
        }
