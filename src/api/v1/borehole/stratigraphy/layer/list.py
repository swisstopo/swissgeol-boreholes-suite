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
            layer.chronostratigraphy_id_cli AS chronostratigraphy,
            layer.uscs_1_id_cli AS uscs_1

        FROM
            bdms.layer

        INNER JOIN bdms.stratigraphy
        ON id_sty = id_sty_fk
        
        INNER JOIN bdms.borehole
        ON stratigraphy.id_bho_fk = id_bho

        INNER JOIN (
            SELECT
                id_bho_fk,
                array_agg(
                    json_build_object(
                        'workflow', id_wkf,
                        'role', name_rol,
                        'username', username,
                        'started', started,
                        'finished', finished
                    )
                ) as status
            FROM (
                SELECT
                    id_bho_fk,
                    name_rol,
                    id_wkf,
                    username,
                    started_wkf as started,
                    finished_wkf as finished
                FROM
                    bdms.workflow,
                    bdms.roles,
                    bdms.users
                WHERE
                    id_rol = id_rol_fk
                AND
                    id_usr = id_usr_fk
                ORDER BY
                    id_bho_fk asc, id_wkf asc
            ) t
            GROUP BY
                id_bho_fk
        ) as v
        ON
            v.id_bho_fk = id_bho
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
