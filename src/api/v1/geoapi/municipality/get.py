# -*- coding: utf-8 -*-
from bms.v1.action import Action


class GetMunicipality(Action):

    async def execute(self, id):
        rec = await self.conn.fetchrow("""
            SELECT row_to_json(muns)
            FROM (
                SELECT
                    municipalities.gid AS id,
                    municipalities.name,
                    cantons.kantonsnum AS cid,
                    cantons.name AS cname,
                    ST_AsGeoJSON(
                        ST_Envelope(municipalities.geom), 2, 2
                    )::json as geom
                FROM
                    bdms.municipalities, (
                        SELECT distinct kantonsnum, name
                        from bdms.cantons
                    ) as cantons
                WHERE
                    municipalities.kantonsnum = cantons.kantonsnum
                AND
                    municipalities.gid = $1
            ) as muns
        """, id)
        return {
            "data": self.decode(rec[0]) if rec[0] is not None else None
        }
