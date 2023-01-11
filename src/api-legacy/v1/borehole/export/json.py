# -*- coding: utf-8 -*-
from bms.v1.action import Action
from io import StringIO
import traceback
import json
import datetime


class ExportJson(Action):

    async def execute(self, filter={}, user=None):

        language = 'en'
        if (
            'language' in filter
            and filter['language'] in ['it', 'de', 'fr']
        ):
            language = filter['language']

        permissions = None
        if user is not None:
            permissions = self.filterPermission(user)

        where, params = self.filterBorehole(filter)

        sql = """
        SELECT
            id_bho as id,

            original_name_bho as original_name,
            project_name_bho as project_name,
            alternate_name_bho as alternate_name,
            knd.geolcode as kind,

            rest.geolcode as restriction,
            to_char(
                restriction_until_bho,
                'YYYY-MM-DD'
            ) as restriction_until,

            location_x_bho as location_x,
            location_y_bho as location_y,
            location_x_lv03_bho as location_x_lv03,
            location_y_lv03_bho as location_y_lv03,
            srd.geolcode as srs,
            
            qtloc.geolcode as qt_location,
            elevation_z_bho as elevation_z,
            hrs.geolcode as hrs,
            qth.geolcode as qt_elevation,

            reference_elevation_bho as reference_elevation,
            qre.geolcode as qt_reference_elevation,
            ret.geolcode as reference_elevation_type,

            cnt.name as canton,
            municipalities.name as city,

            meth.geolcode as drilling_method,
            to_char(
                drilling_date_bho,
                'YYYY-MM-DD'
            ) as drilling_date,
            to_char(
                spud_date_bho,
                'YYYY-MM-DD'
            ) as spud_date,
            cut.geolcode as cuttings,
            prp.geolcode as purpose,
            drilling_diameter_bho as drill_diameter,
            sts.geolcode as status,
            inclination_bho as inclination,
            inclination_direction_bho as inclination_direction,
            qt_inc_dir.geolcode as qt_bore_inc_dir,

            total_depth_bho as total_depth,
            qt_len.geolcode as qt_depth,

            top_bedrock_bho as top_bedrock,
            qt_tbed.geolcode as qt_top_bedrock,

            top_bedrock_tvd_bho as top_bedrock_tvd,
            qt_tbed_tvd.geolcode as qt_top_bedrock_tvd,

            groundwater_bho as groundwater,
            stratigraphies

        FROM
            bdms.borehole

        LEFT JOIN bdms.codelist as qt_tbed_tvd
            ON qt_tbed_tvd.id_cli = qt_top_bedrock_tvd_id_cli

        LEFT JOIN bdms.codelist as qt_tbed
            ON qt_tbed.id_cli = qt_top_bedrock_id_cli

        LEFT JOIN bdms.codelist as rest
            ON rest.id_cli = restriction_id_cli

        LEFT JOIN bdms.codelist as knd
            ON knd.id_cli = kind_id_cli

        LEFT JOIN bdms.codelist as srd
            ON srd.id_cli = srs_id_cli

        LEFT JOIN bdms.codelist as qtloc
            ON qtloc.id_cli = qt_location_id_cli

        LEFT JOIN bdms.codelist as hrs
            ON hrs.id_cli = hrs_id_cli

        LEFT JOIN bdms.codelist as qth
            ON qth.id_cli = qt_elevation_id_cli
                    
        LEFT JOIN bdms.codelist as qre
            ON qre.id_cli = qt_reference_elevation_id_cli

        LEFT JOIN bdms.codelist as ret
            ON ret.id_cli = reference_elevation_type_id_cli

        LEFT JOIN (
            SELECT DISTINCT
                cantons.kantonsnum,
                cantons.name
            FROM
                bdms.cantons
        ) AS cnt
        ON cnt.kantonsnum = canton_bho

        LEFT JOIN bdms.codelist as qt_len
            ON qt_len.id_cli = qt_depth_id_cli

        LEFT JOIN bdms.codelist as qt_inc_dir
            ON qt_inc_dir.id_cli = qt_inclination_direction_id_cli

        LEFT JOIN bdms.codelist as cut
            ON cut.id_cli = cuttings_id_cli

        LEFT JOIN bdms.municipalities
            ON municipalities.gid = city_bho

        LEFT JOIN bdms.codelist as meth
            ON meth.id_cli = drilling_method_id_cli

        LEFT JOIN bdms.codelist as prp
            ON prp.id_cli = purpose_id_cli

        LEFT JOIN bdms.codelist as sts
            ON sts.id_cli = status_id_cli

        LEFT JOIN (
            
            SELECT
                borehole,
                array_to_json(
                    array_agg(
                        row_to_json(t)
                    )
                ) as stratigraphies
            FROM (
                SELECT
                    id_sty as id,
                    stratigraphy.id_bho_fk as borehole,
                    stratigraphy_kind.geolcode as kind,
                    name_sty as name,
                    primary_sty as primary,
                    to_char(
                        date_sty,
                        'YYYY-MM-DD'
                    ) as date,
                    lys.layers
                FROM
                bdms.stratigraphy

                INNER JOIN bdms.borehole
                ON stratigraphy.id_bho_fk = id_bho

                LEFT JOIN bdms.codelist as stratigraphy_kind
                ON stratigraphy_kind.id_cli = stratigraphy.kind_id_cli

                LEFT JOIN (
                    SELECT
                        stratigraphy,
                        array_to_json(
                            array_agg(
                                row_to_json(t)
                            )
                        ) as layers
                    FROM (
            
                        SELECT stratigraphy, row_to_json(t)
                        FROM (
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
                                COALESCE(
                                    lithological_description_lay, ''
                                ) AS lithological_description,
                                COALESCE(
                                    facies_description_lay, ''
                                ) AS facies_description,
                                last_lay AS last,
                                layer_qt_description.geolcode AS qt_description,
                                layer_lithology.geolcode AS lithology,
                                layer_lithostratigraphy.geolcode AS lithostratigraphy,
                                layer_chronostratigraphy.geolcode AS chronostratigraphy,
                                layer_symbol.geolcode AS symbol,
                                COALESCE(
                                    mlpr112, '{}'::int[]
                                ) AS color,
                                layer_plasticity.geolcode AS plasticity,
                                layer_humidity.geolcode AS humidity,
                                layer_consistance.geolcode AS consistance,
                                layer_gradation.geolcode AS gradation,
                                layer_alteration.geolcode AS alteration,
                                compactness.geolcode AS compactness,
                                COALESCE(
                                    mlpr113, '{}'::int[]
                                ) AS jointing,
                                COALESCE(
                                    mlpr108, '{}'::int[]
                                ) AS organic_component,
                                striae_lay AS striae,
                                stratigraphy_grain_size_1.geolcode AS grain_size_1,
                                stratigraphy_grain_size_2.geolcode AS grain_size_2,
                                COALESCE(
                                    mlpr110, '{}'::int[]
                                ) AS grain_shape,
                                COALESCE(
                                    mlpr115, '{}'::int[]
                                ) AS grain_granularity,
                                stratigraphy_cohesion.geolcode AS cohesion,
                                stratigraphy_uscs_1.geolcode AS uscs_1,
                                stratigraphy_uscs_2.geolcode AS uscs_2,
                                COALESCE(
                                    mcla101, '{}'::int[]
                                ) AS uscs_3,
                                COALESCE(
                                    uscs_original_lay, ''
                                ) AS uscs_original,
                                COALESCE(
                                    mcla104, '{}'::int[]
                                ) AS uscs_determination,
                                COALESCE(
                                    mcla107, '{}'::int[]
                                ) AS debris,
                                lithology_top_bedrock_id_cli AS lithology_top_bedrock,
                                COALESCE(
                                    notes_lay, ''
                                ) AS notes,
                                stratigraphy_kind.geolcode AS kind
                            FROM
                                bdms.layer

                            INNER JOIN bdms.stratigraphy as stratigraphy
                            ON id_sty_fk = stratigraphy.id_sty

                            LEFT JOIN bdms.codelist as layer_qt_description
                            ON layer_qt_description.id_cli = layer.qt_description_id_cli

                            LEFT JOIN bdms.codelist as layer_lithology
                            ON layer_lithology.id_cli = layer.lithology_id_cli

                            LEFT JOIN bdms.codelist as layer_lithostratigraphy
                            ON layer_lithostratigraphy.id_cli = layer.lithostratigraphy_id_cli

                            LEFT JOIN bdms.codelist as layer_chronostratigraphy
                            ON layer_chronostratigraphy.id_cli = layer.chronostratigraphy_id_cli

                            LEFT JOIN bdms.codelist as layer_plasticity
                            ON layer_plasticity.id_cli = layer.plasticity_id_cli

                            LEFT JOIN bdms.codelist as layer_humidity
                            ON layer_humidity.id_cli = layer.humidity_id_cli

                            LEFT JOIN bdms.codelist as layer_consistance
                            ON layer_consistance.id_cli = layer.consistance_id_cli

                            LEFT JOIN bdms.codelist as layer_gradation
                            ON layer_gradation.id_cli = layer.gradation_id_cli

                            LEFT JOIN bdms.codelist as layer_alteration
                            ON layer_alteration.id_cli = layer.alteration_id_cli

                            LEFT JOIN bdms.codelist as compactness
                            ON compactness.id_cli = layer.compactness_id_cli

                            LEFT JOIN bdms.codelist as stratigraphy_grain_size_1
                            ON stratigraphy_grain_size_1.id_cli = layer.grain_size_1_id_cli

                            LEFT JOIN bdms.codelist as stratigraphy_grain_size_2
                            ON stratigraphy_grain_size_2.id_cli = layer.grain_size_2_id_cli

                            LEFT JOIN bdms.codelist as stratigraphy_cohesion
                            ON stratigraphy_cohesion.id_cli = layer.cohesion_id_cli

                            LEFT JOIN bdms.codelist as stratigraphy_uscs_1
                            ON stratigraphy_uscs_1.id_cli = layer.uscs_1_id_cli

                            LEFT JOIN bdms.codelist as stratigraphy_uscs_2
                            ON stratigraphy_uscs_2.id_cli = layer.uscs_2_id_cli

                            LEFT JOIN bdms.codelist as stratigraphy_kind
                            ON stratigraphy_kind.id_cli = stratigraphy.kind_id_cli

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

                            INNER JOIN bdms.users as creator
                            ON creator_lay = creator.id_usr

                            INNER JOIN bdms.users as updater
                            ON updater_lay = updater.id_usr

                            LEFT JOIN (
                                SELECT
                                    id_lay_fk, array_agg(geolcode) as mlpr112
                                FROM
                                    bdms.layer_codelist,
                                    bdms.codelist
                                WHERE
                                    id_cli_fk = id_cli
                                AND
                                    codelist.code_cli = 'mlpr112'
                                GROUP BY id_lay_fk
                            ) clr
                            ON clr.id_lay_fk = id_lay

                            LEFT JOIN (
                                SELECT
                                    id_lay_fk, array_agg(geolcode) as mlpr113
                                FROM
                                    bdms.layer_codelist,
                                    bdms.codelist
                                WHERE
                                    id_cli_fk = id_cli
                                AND
                                    codelist.code_cli = 'mlpr113'
                                GROUP BY id_lay_fk
                            ) jng
                            ON jng.id_lay_fk = id_lay

                            LEFT JOIN (
                                SELECT
                                    id_lay_fk, array_agg(geolcode) as mlpr108
                                FROM
                                    bdms.layer_codelist,
                                    bdms.codelist
                                WHERE
                                    id_cli_fk = id_cli
                                AND
                                    codelist.code_cli = 'mlpr108'
                                GROUP BY id_lay_fk
                            ) oco
                            ON oco.id_lay_fk = id_lay

                            LEFT JOIN (
                                SELECT
                                    id_lay_fk, array_agg(geolcode) as mlpr110
                                FROM
                                    bdms.layer_codelist,
                                    bdms.codelist
                                WHERE
                                    id_cli_fk = id_cli
                                AND
                                    codelist.code_cli = 'mlpr110'
                                GROUP BY id_lay_fk
                            ) gsh
                            ON gsh.id_lay_fk = id_lay

                            LEFT JOIN (
                                SELECT
                                    id_lay_fk, array_agg(geolcode) as mlpr115
                                FROM
                                    bdms.layer_codelist,
                                    bdms.codelist
                                WHERE
                                    id_cli_fk = id_cli
                                AND
                                    codelist.code_cli = 'mlpr115'
                                GROUP BY id_lay_fk
                            ) ggr
                            ON ggr.id_lay_fk = id_lay

                            LEFT JOIN (
                                SELECT
                                    id_lay_fk, array_agg(geolcode) as mcla101
                                FROM
                                    bdms.layer_codelist,
                                    bdms.codelist
                                WHERE
                                    id_cli_fk = id_cli
                                AND
                                    codelist.code_cli = 'mcla101'
                                GROUP BY id_lay_fk
                            ) us3
                            ON us3.id_lay_fk = id_lay

                            LEFT JOIN (
                                SELECT
                                    id_lay_fk, array_agg(geolcode) as mcla104
                                FROM
                                    bdms.layer_codelist,
                                    bdms.codelist
                                WHERE
                                    id_cli_fk = id_cli
                                AND
                                    codelist.code_cli = 'mcla104'
                                GROUP BY id_lay_fk
                            ) usd
                            ON usd.id_lay_fk = id_lay

                            LEFT JOIN (
                                SELECT
                                    id_lay_fk, array_agg(geolcode) as mcla107
                                FROM
                                    bdms.layer_codelist,
                                    bdms.codelist
                                WHERE
                                    id_cli_fk = id_cli
                                AND
                                    codelist.code_cli = 'mcla107'
                                GROUP BY id_lay_fk
                            ) dbr
                            ON dbr.id_lay_fk = id_lay

                        ) AS t

                    ) AS t
                    GROUP BY
                        stratigraphy
                ) AS lys
                ON stratigraphy.id_sty = lys.stratigraphy

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
                    GROUP BY id_bho_fk
                ) as v
                ON v.id_bho_fk = id_bho
            ) AS t

            group by borehole
            
        ) as str
        ON id_bho = borehole
        
        """

        if len(where) > 0:
            sql += """
                WHERE %s
            """ % " AND ".join(where)

        if permissions is not None:
            operator = 'AND' if len(where) > 0 else 'WHERE'
            sql += f"""
                {operator} {permissions}
            """

        rec = await self.conn.fetchval(
            """
            SELECT
                array_to_json(
                    array_agg(
                        row_to_json(t)
                    )
                )
            FROM (
                %s
                ORDER BY 1
            ) AS t
        """ % sql, *(params))

        data = self.decode(rec) if rec is not None else []

        jsonfile = StringIO()

        now = datetime.datetime.now()

        if len(data) > 0:

            jsonfile.write(
                json.dumps({
                    "date": now.strftime("%Y%m%d%H%M%S"),
                    "version": "1.0.0",
                    "data": data
                })
            )

        return jsonfile
