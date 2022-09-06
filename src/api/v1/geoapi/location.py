# -*- coding: utf-8 -*-
from bms.v1.action import Action
import asyncio

class GetLocation(Action):

    async def execute(self, easting, northing):
        rec = await self.conn.fetchrow("""
            SELECT
                row_to_json(t)
            FROM (
                SELECT
                    cantons.kantonsnum as cid,
                    cantons.name as canton,
                    municipalities.gid as mid,
                    municipalities.name as municipality
                FROM
                    (
                    SELECT ST_SetSRID(
                        ST_GeomFromText(
                            $1
                        ), 2056
                    ) AS point
                ) as g
                LEFT JOIN
                    bdms.cantons
                ON ST_Intersects(
                    g.point,
                    ST_Transform(
                        ST_SetSRID(cantons.geom, 21781), 2056
                    )
                )
                LEFT JOIN
                    bdms.municipalities
                ON ST_Intersects(
                    g.point,
                    ST_Transform(
                        ST_SetSRID(municipalities.geom, 21781), 2056
                    )
                )
            ) AS t
        """, 'POINT(%s %s)' % (easting, northing))

        return {
            "data": self.decode(rec[0]) if rec[0] is not None else None
        }
