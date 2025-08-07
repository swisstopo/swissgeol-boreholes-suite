# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.borehole.get import GetBorehole
from bms.v1.borehole.profile import ValidateProfile
from bms.v1.borehole.profile.get import GetProfile

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
            END AS msm_to

        FROM
            bdms.layer

        INNER JOIN
            bdms.stratigraphy
        ON
            id_sty = id_sty_fk

        INNER JOIN
            bdms.borehole
        ON
            stratigraphy.id_bho_fk = id_bho
    """

    async def execute(self, id, withValidation=False, user=None):

        config = {
            "title": "custom.lithostratigraphy_top_bedrock",
            "description": "custom.lithology_top_bedrock"
        }

        permissions = ''
        if user is not None:
            permissions = """
                AND {}
            """.format(
                self.filterPermission(user)
            )

        sql = ListGeologyLayers.sql

        rec = await self.conn.fetchval(f"""
            SELECT
                array_to_json(
                    array_agg(
                        row_to_json(t)
                    )
                )
            FROM (

                {sql}

                WHERE
                    id_sty_fk = $1

                {permissions}

                ORDER BY
                    depth_from_lay,
                    id_lay

            ) AS t
        """, id)

        data = self.decode(rec, [])

        if withValidation is True:

            # Get the Borehole general information
            profile = (
                await GetProfile(self.conn).execute(id, user)
            )["data"]

            borehole = (await GetBorehole(self.conn).execute(
                profile["borehole"]["id"], user=user
            ))["data"]

            validation = await ValidateProfile(self.conn).execute(
                profile, borehole, data, user=user
            )

            validation.update({
                "config": config
            })

            return validation

        else:

            return {
                "config": config,
                "data": data
            }


class ListGeologyLayers(ListLayers):

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

            layer.lithostratigraphy_id_cli as title,
            layer.lithology_id_cli as description,
            color.conf_cli -> 'color' as rgb,
            pattern.conf_cli ->> 'image' as pattern

        FROM
            bdms.layer

        LEFT JOIN
            bdms.codelist as color
        ON
            color.id_cli = lithostratigraphy_id_cli

        LEFT JOIN
            bdms.codelist as pattern
        ON
            pattern.id_cli = lithology_id_cli

        INNER JOIN
            bdms.stratigraphy
        ON
            id_sty = id_sty_fk

        INNER JOIN
            bdms.borehole
        ON
            stratigraphy.id_bho_fk = id_bho


    """
