# -*- coding: utf-8 -*-
from bms.v1.action import Action


class GetLayer(Action):

    key_to_table_column = {
        'color': {'table': 'bdms.layer_color_codelist', 'column': 'color_id'},
        'organic_components': {'table': 'bdms.layer_organic_component_codelist', 'column': 'organic_components_id'},
        'grain_shape': {'table': 'bdms.layer_grain_shape_codelist', 'column': 'grain_shape_id'},
        'uscs_3': {'table': 'bdms.layer_uscs3_codelist', 'column': 'uscs3_id'},
        'grain_angularity': {'table': 'bdms.layer_grain_angularity_codelist', 'column': 'grain_angularity_id'},
        'debris': {'table': 'bdms.layer_debris_codelist', 'column': 'debris_id'}
    }

    joins = []
    for key, value in key_to_table_column.items():
        joins.append(f"""
            LEFT JOIN (
                SELECT
                    layer_id, array_agg({value['column']}) as {key}
                FROM
                    {value['table']}
                GROUP BY layer_id
            ) {key}
            ON {key}.layer_id = id_lay
        """)

    sql = f"""
        SELECT
            id_lay AS id,
            stratigraphy.id_sty AS stratigraphy,
            (
                select row_to_json(t)
                FROM (
                    SELECT
                        creator.id_usr as id,
                        creator.username as username,
                        to_char(
                            creation_lay,
                            'YYYY-MM-DD"T"HH24:MI:SSOF'
                        ) as date
                ) t
            ) as creator,
            (
                select row_to_json(t)
                FROM (
                    SELECT
                        updater.id_usr as id,
                        updater.username as username,
                        to_char(
                            update_lay,
                            'YYYY-MM-DD"T"HH24:MI:SSOF'
                        ) as date
                ) t
            ) as updater,
            depth_from_lay AS depth_from,
            depth_to_lay AS depth_to,
            last_lay AS last,
            layer.qt_description_id_cli AS description_quality,
            layer.lithology_id_cli AS lithology,
            layer.lithostratigraphy_id_cli AS lithostratigraphy,
            COALESCE(
                colour, '{{}}'::int[]
            ) AS color,
            layer.plasticity_id_cli AS plasticity,
            layer.humidity_id_cli AS humidity,
            layer.consistance_id_cli AS consistance,
            layer.gradation_id_cli AS gradation,
            layer.alteration_id_cli AS alteration,
            layer.compactness_id_cli AS compactness,
            COALESCE(
                organic_components, '{{}}'::int[]
            ) AS organic_component,
            striae_lay AS striae,
            layer.grain_size_1_id_cli AS grain_size_,
            layer.grain_size_2_id_cli AS grain_size_2,
            COALESCE(
                grain_shape, '{{}}'::int[]
            ) AS grain_shape,
            COALESCE(
                grain_angularity, '{{}}'::int[]
            ) AS grain_granularity,
            layer.cohesion_id_cli AS cohesion,
            layer.uscs_1_id_cli AS uscs_1,
            layer.uscs_2_id_cli AS uscs_2,
            COALESCE(
                uscs_type, '{{}}'::int[]
            ) AS uscs_3,
            layer.lithology_top_bedrock_id_cli AS lithology_top_bedrock,
            COALESCE(
                uscs_original_lay, ''
            ) AS uscs_original,
            COALESCE(
                original_lithology, ''
            ) AS original_lithology,
            uscs_determination_id_cli AS uscs_determination,
            COALESCE(
                debris, '{{}}'::int[]
            ) AS debris,
            COALESCE(
                notes_lay, ''
            ) AS notes,

        FROM
            bdms.layer

        INNER JOIN bdms.stratigraphy as stratigraphy
        ON layer.id_sty_fk = stratigraphy.id_sty

        INNER JOIN bdms.borehole
        ON stratigraphy.id_bho_fk = id_bho

        INNER JOIN bdms.users as creator
        ON creator_lay = creator.id_usr

        INNER JOIN bdms.users as updater
        ON updater_lay = updater.id_usr
        {' '.join(joins) if joins else ''}

    """

    async def execute(self, id, user=None):

        permission = ''

        if user is not None:
            permission = """
                AND {}
            """.format(
                self.filterPermission(user)
            )

        rec = await self.conn.fetchrow(f"""
            SELECT row_to_json(t)
            FROM (
                {GetLayer.sql}

                WHERE id_lay = $1
                {permission}
            ) AS t
        """, id)
        return {
            "data": self.decode(rec[0]) if rec[0] is not None else None
        }
