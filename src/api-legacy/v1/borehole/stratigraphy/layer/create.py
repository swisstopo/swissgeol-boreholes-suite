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

        kind = await self.conn.fetchval(f"""
            SELECT
                stratigraphy.kind_id_cli
            FROM
                bdms.stratigraphy
            WHERE
                id_sty = $1
        """, id)

        depth_from = 0

        if cnt > 0 and kind == 3000:

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
                    l.depth_from_lay = b.top_bedrock_bho
                AND
                    b.top_bedrock_bho IS NOT NULL
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
                        depth_to_lay <= top_bedrock_bho
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
                            depth_to_lay >= top_bedrock_bho
                        ORDER BY
                            depth_to_lay DESC
                        LIMIT 1
                    """, id)

                    if row is not None:
                        depth_from = row[0]

        elif kind == 3003:
            depth_from = None

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


class CreateInstrument(CreateLayer):

    async def execute(self, id, user_id, casing = None):

        # Check if casing exists
        exists = await self.conn.fetchval(
            """
                SELECT EXISTS(
                    SELECT 1
                    FROM bdms.stratigraphy
                    WHERE
                        id_sty = $1
                ) AS exists
            """, casing
        )

        if exists is False:
            raise NotFound()

        kind = await self.conn.fetchval(f"""
            SELECT
                stratigraphy.kind_id_cli
            FROM
                bdms.stratigraphy
            WHERE
                id_sty = $1
        """, id)

        # raise exception if stratigraphy kind is not 3003 (instruement)
        if kind != 3003:
            raise ActionWrong()

        if casing is not None:
            kind = await self.conn.fetchval(f"""
                SELECT
                    stratigraphy.kind_id_cli
                FROM
                    bdms.stratigraphy
                WHERE
                    id_sty = $1
            """, casing)

            # raise exception if stratigraphy kind is not 3003 (instruement)
            if kind != 3002:
                raise ActionWrong()
        
        return {
            "id": (
                await self.conn.fetchval("""
                    INSERT INTO bdms.layer(
                        id_sty_fk, creator_lay, updater_lay,
                        last_lay, instr_id_sty_fk
                    )
                    VALUES ($1, $2, $2, False, $3) RETURNING id_lay
                """, id, user_id, casing)
            )
        }