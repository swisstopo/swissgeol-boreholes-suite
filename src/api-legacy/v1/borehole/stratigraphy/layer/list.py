# -*- coding: utf-8 -*-
from bms.v1.action import Action


class ListLayers(Action):

    sql = """
        SELECT
            id_lay as id,
            depth_from_lay as depth_from,
            depth_to_lay as depth_to,
            CASE
                WHEN elevation_z_bho is NULL THEN NULL
                ELSE elevation_z_bho - depth_from_lay
            END AS msm_from,
            CASE
                WHEN elevation_z_bho is NULL THEN NULL
                ELSE elevation_z_bho - depth_to_lay
            END AS msm_to,
            lithostratigraphy_id_cli as lithostratigraphy,
            layer.lithology_id_cli as lithology,
            layer.uscs_1_id_cli AS uscs_1

        FROM
            bdms.layer

        INNER JOIN bdms.stratigraphy
        ON id_sty = id_sty_fk

        INNER JOIN bdms.borehole
        ON stratigraphy.id_bho_fk = id_bho
    """

    async def execute(self, id, user=None):

        permissions = ''
        if user is not None:
            permissions = """
                AND {}
            """.format(
                self.filterPermission(user)
            )

        rec = await self.conn.fetchval(f"""
            SELECT
                array_to_json(
                    array_agg(
                        row_to_json(t)
                    )
                )
            FROM (

                {ListLayers.sql}

                WHERE
                    id_sty_fk = $1

                {permissions}

                ORDER BY
                    depth_from_lay,
                    id_lay

            ) AS t
        """, id)

        return {
            "data": self.decode(rec) if rec is not None else []
        }
