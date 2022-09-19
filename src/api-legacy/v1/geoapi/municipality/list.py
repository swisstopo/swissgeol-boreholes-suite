# -*- coding: utf-8 -*-
from bms.v1.action import Action


class ListMunicipality(Action):
    async def execute(self):
        res = await self.conn.fetchval("""
            SELECT array_to_json(array_agg(row_to_json(muns)))
            FROM (
                SELECT
                    municipalities.gid AS id,
                    municipalities.name,
                    cantons.kantonsnum AS cid,
                    cantons.name AS cname,
                    ST_AsGeoJSON(
                        ST_Envelope(
                            ST_Transform(
                                ST_SetSRID(
                                    municipalities.geom,
                                    21781
                                ), 2056
                            )
                        ), 2, 2
                    )::json as geom
                FROM
                    bdms.municipalities, (
                        SELECT DISTINCT
                            kantonsnum,
                            name
                        FROM
                            bdms.cantons
                    ) as cantons
                WHERE
                    municipalities.kantonsnum = cantons.kantonsnum
                ORDER BY
                    name
            ) as muns
        """)
        return {
            "data": self.decode(res) if res is not None else []
        }
