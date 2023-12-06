# -*- coding: utf-8 -*-
from bms.v1.action import Action
import math


class ListWorkgroups(Action):

    async def execute(self):

        val = await self.conn.fetchval(
            """
                SELECT
                    array_to_json(
                        array_agg(
                            row_to_json(t)
                        )
                    )
                FROM (
                    SELECT
                        id_wgp as id,
                        name_wgp as name,
                        supplier_wgp as supplier,
                        to_char(
                            disabled_wgp,
                            'YYYY-MM-DD"T"HH24:MI:SSOF'
                        ) as disabled,
                        to_char(
                            created_wgp,
                            'YYYY-MM-DD"T"HH24:MI:SSOF'
                        ) as created,
                        count(id_bho) as boreholes
                        
                    FROM bdms.workgroups
                    
                    LEFT JOIN bdms.borehole
                    ON id_wgp = id_wgp_fk

                    /*WHERE
                        supplier_wgp IS FALSE*/
                    
                    GROUP BY
                        id_wgp, name_wgp

                    ORDER BY
                        name_wgp
                ) as t
            """
        )

        return {
            "data": self.decode(val) if val is not None else []
        }
