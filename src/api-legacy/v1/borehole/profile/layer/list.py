# -*- coding: utf-8 -*-
from typing import List
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

        INNER JOIN (
            SELECT
                id_bho_fk,
                array_agg (
                    json_build_object (
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

    async def execute(self, id, withValidation=False, user=None):

        config = {
            "title": "custom.lithostratigraphy_top_bedrock",
            "description": "custom.lithology_top_bedrock"
        }
        kind = await self.conn.fetchval(f"""
            SELECT
                kind_id_cli,
                id_bho_fk
            FROM
                bdms.stratigraphy
            WHERE
                id_sty = $1
        """, id)

        permissions = ''
        if user is not None:
            permissions = """
                AND {}
            """.format(
                self.filterPermission(user)
            )

        sql = ListLayers.sql

        if kind == 3000:
            sql = ListGeologyLayers.sql

        elif kind == 3001:
            sql = ListGeologyLayers.sql

        elif kind == 3002:
            sql = ListCasingLayers.sql
            config = {
                "title": "casi200",
                "subtitle": "casi201",
                "description": "extended.method"
            }

        elif kind == 3003:
            sql = ListInstrumentLayers.sql

        elif kind == 3004:
            sql = ListFillingLayers.sql
            config = {
                "title": "fill100",
                "subtitle": "fill200",
            }

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

        if withValidation is True and kind != 3003:

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
                "config": config,
                "kind": kind
            })

            return validation

        elif kind == 3003:
            return {
                "data": data,
                "kind": kind
            }

        else:

            return {
                "config": config,
                "data": data,
                "kind": kind
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

        INNER JOIN (
            SELECT
                id_bho_fk,
                array_agg (
                    json_build_object (
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


class ListGeotechnicalLayers(ListLayers):

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
            layer.lithostratigraphy_id_cli as description,
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

        INNER JOIN (
            SELECT
                id_bho_fk,
                array_agg (
                    json_build_object (
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


class ListCasingLayers(ListLayers):

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

            layer.casng_kind_id_cli as title,
            layer.casng_material_id_cli as subtitle,
            layer.casng_id as description

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

        INNER JOIN (
            SELECT
                id_bho_fk,
                array_agg (
                    json_build_object (
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


class ListInstrumentLayers(ListLayers):

    sql = """
        SELECT
            id_lay as id,
            depth_from_lay as depth_from,
            depth_to_lay as depth_to,

            COALESCE(instr_id, '') as instrument_id,
            layer.instr_kind_id_cli as instrument_kind,
            layer.instr_status_id_cli AS instrument_status,
            layer.instr_id_sty_fk as instrument_casing_id,
            notes_lay as notes

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

        INNER JOIN (
            SELECT
                id_bho_fk,
                array_agg (
                    json_build_object (
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


class ListFillingLayers(ListLayers):

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

            layer.fill_kind_id_cli as title,
            layer.fill_material_id_cli as subtitle

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

        INNER JOIN (
            SELECT
                id_bho_fk,
                array_agg (
                    json_build_object (
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
