# -*- coding: utf-8 -*-
from bms.v1.action import Action


class ListCanton(Action):
    async def execute(self):
        res = await self.conn.fetchval("""
            SELECT array_to_json(array_agg(row_to_json(cant)))
            FROM (
                SELECT
                    kantonsnum as id,
                    name as name,
                    ST_AsGeoJSON(
                        ST_Envelope(
                            ST_Union(
                                ST_Transform(
                                    ST_SetSRID(geom, 21781), 2056
                                )
                            )
                        ), 2, 2
                    )::json as geom
                FROM
                    bdms.cantons
                GROUP BY kantonsnum, name
                ORDER BY name
            ) as cant
        """)
        return {
            "data": self.decode(res) if res is not None else []
        }
