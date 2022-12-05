# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.borehole import ListBorehole
from bms.v1.borehole.codelist import ListCodeList
import math
from io import StringIO
import traceback
import csv


class ExportCsvFull(Action):

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

        # sql = ListBorehole.get_sql_text(language)
        sql = self.get_sql()

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

        csvfile = None

        if len(data) > 0:

            cl = await ListCodeList(
                self.conn
            ).execute('borehole_form')

            csv_header = {}
            for c in cl['data']['borehole_form']:
                csv_header[c['code']] = c

            identifiers = await ListCodeList(
                self.conn
            ).execute('borehole_identifier')

            for c in identifiers['data']['borehole_identifier']:
                csv_header[c['code']] = c

            csvfile = StringIO()
            
            cw = csv.writer(
                csvfile,
                delimiter=';',
                quotechar='"'
            )
            keys = data[0].keys()
            cols = []
            for key in keys:
                # Excluding identifiers column
                if key != 'identifiers':
                    cols.append(
                        csv_header[key][language]['text']
                        if key in csv_header else key
                    )

            extra_col = []
            extra_geol = []
            for identifier in identifiers['data']['borehole_identifier']:
                extra_col.append(
                    identifier[language]['text']
                )
                extra_geol.append(
                    identifier['id']
                )

            cw.writerow(cols + extra_col)

            for row in data:
                r = []
                for col in keys:
                    if col == 'identifiers':
                        for xc in extra_geol:
                            val = None
                            if row[col] is not None:
                                for identifier in row[col]:
                                    if identifier[
                                        'borehole_identifier'
                                    ] ==  xc:
                                        val = identifier[
                                            'identifier_value'
                                        ]
                                        break
                            
                            r.append(val)

                    else:
                        if isinstance(row[col], list):
                            r.append(",".join(str(x) for x in row[col]))
                        else:
                            r.append(row[col])
                cw.writerow(r)

        return csvfile

    def get_sql(self):
        return """
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
                
                ctn.name as canton,
                -- cantons.name as canton,
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

                sty.stratigraphy_id,
                sty.stratigraphy_name,
                sty.depth_from,
                sty.depth_to,
                sty.description,
                sty.geology,
                sty.qt_description,
                sty.lithology,
                sty.lithostratigraphy,
                sty.chronostratigraphy,
                sty.tectonic_unit,
                sty.symbol,
                sty.color,
                sty.plasticity,
                sty.humidity,
                sty.consistance,
                sty.gradation,
                sty.alteration,
                sty.compactness,
                sty.jointing,
                sty.soil_state,
                sty.organic_component,
                sty.striae,
                sty.grain_size_1,
                sty.grain_size_2,
                sty.grain_shape,
                sty.grain_granularity,
                sty.uscs_1,
                sty.uscs_2,
                sty.uscs_3,
                sty.uscs_original,
                sty.uscs_determination,
                sty.unconrocks,
                sty.debris,
                sty.lithology_top_bedrock,
                sty.lithok,
                sty.kirost,
                sty.notes,

                identifiers

            FROM
                bdms.borehole

            LEFT JOIN (
                SELECT
                    id_bho_fk,
                    array_to_json(array_agg(j)) as identifiers
                FROM (
                    SELECT
                        id_bho_fk,
                        json_build_object(
                            'borehole_identifier', 
                            geolcode,
                            'identifier_value',
                            value_bco
                        ) as j
                    FROM
                        bdms.borehole_codelist
                    INNER JOIN
                        bdms.codelist
                    ON
                        id_cli_fk = id_cli
                    WHERE
                        borehole_codelist.code_cli = 'borehole_identifier'
                ) t
                GROUP BY
                    id_bho_fk
            ) as idf
            ON
                idf.id_bho_fk = id_bho

            INNER JOIN (

                SELECT
                    id_bho_fk,
                    id_sty as stratigraphy_id,
                    name_sty as stratigraphy_name,
                    depth_from_lay AS depth_from,
                    depth_to_lay AS depth_to,
                    COALESCE(
                        lithological_description_lay, ''
                    ) AS lithological_description,
                    COALESCE(
                        facies_description_lay, ''
                    ) AS facies_description,
                    lay_qt_desc.geolcode AS qt_description,
                    lay_lith.geolcode AS lithology,
                    lay_lith_stra.geolcode AS lithostratigraphy,
                    lay_chrono_strati.geolcode AS chronostratigraphy,
                    lay_tectonic_unit.geolcode AS tectonic_unit,
                    lay_symbol.geolcode AS symbol,
                    COALESCE(
                        mlpr112, '{}'::int[]
                    ) AS color,
                    lay_plasticity.geolcode AS plasticity,
                    lay_plasticity.geolcode AS humidity,
                    lay_consistance.geolcode AS consistance,
                    lay_gradation.geolcode AS gradation,
                    lay_alteration.geolcode AS alteration,
                    lay_compactness.geolcode AS compactness,
                    COALESCE(
                        mlpr113, '{}'::int[]
                    ) AS jointing,
                    lay_soil_state.geolcode AS soil_state,
                    COALESCE(
                        mlpr108, '{}'::int[]
                    ) AS organic_component,
                    striae_lay AS striae,
                    lay_grain_size_1.geolcode AS grain_size_1,
                    lay_grain_size_2.geolcode AS grain_size_2,
                    COALESCE(
                        mlpr110, '{}'::int[]
                    ) AS grain_shape,
                    COALESCE(
                        mlpr115, '{}'::int[]
                    ) AS grain_granularity,
                    lay_cohesion.geolcode AS cohesion,
                    lay_uscs_1.geolcode AS uscs_1,
                    lay_uscs_2.geolcode AS uscs_2,
                    COALESCE(
                        mcla101, '{}'::int[]
                    ) AS uscs_3,
                    COALESCE(
                        uscs_original_lay, ''
                    ) AS uscs_original,
                    COALESCE(
                        mcla104, '{}'::int[]
                    ) AS uscs_determination,
                    lay_unconrocks.geolcode AS unconrocks,
                    COALESCE(
                        mcla107, '{}'::int[]
                    ) AS debris,
                    lithology_top_bedrock_id_cli AS lithology_top_bedrock,
                    lay_lithok.geolcode AS lithok,
                    lay_kirost.geolcode AS kirost,
                    COALESCE(
                        notes_lay, ''
                    ) AS notes

                FROM
                    bdms.stratigraphy

                INNER JOIN
                    bdms.layer
                ON
                    layer.id_sty_fk = id_sty

                LEFT JOIN bdms.codelist as lay_kirost
                    ON lay_kirost.id_cli = kirost_id_cli

                LEFT JOIN bdms.codelist as lay_lithok
                    ON lay_lithok.id_cli = lithok_id_cli

                LEFT JOIN (
                    SELECT
                        id_lay_fk, array_agg(geolcode) as mcla107
                    FROM
                        bdms.layer_codelist
                    INNER JOIN
                        bdms.codelist
                    ON
                        layer_codelist.id_cli_fk = codelist.id_cli
                    WHERE
                        layer_codelist.code_cli = 'mcla107'
                    GROUP BY id_lay_fk
                ) dbr
                ON dbr.id_lay_fk = id_lay

                LEFT JOIN bdms.codelist as lay_unconrocks
                    ON lay_unconrocks.id_cli = unconrocks_id_cli

                LEFT JOIN (
                    SELECT
                        id_lay_fk, array_agg(geolcode) as mcla104
                    FROM
                        bdms.layer_codelist
                    INNER JOIN
                        bdms.codelist
                    ON
                        layer_codelist.id_cli_fk = codelist.id_cli
                    WHERE
                        layer_codelist.code_cli = 'mcla104'
                    GROUP BY id_lay_fk
                ) usd
                ON usd.id_lay_fk = id_lay

                LEFT JOIN (
                    SELECT
                        id_lay_fk, array_agg(geolcode) as mcla101
                    FROM
                        bdms.layer_codelist
                    INNER JOIN
                        bdms.codelist
                    ON
                        layer_codelist.id_cli_fk = codelist.id_cli
                    WHERE
                        layer_codelist.code_cli = 'mcla101'
                    GROUP BY id_lay_fk
                ) us3
                ON us3.id_lay_fk = id_lay

                LEFT JOIN bdms.codelist as lay_uscs_2
                    ON lay_uscs_2.id_cli = uscs_2_id_cli

                LEFT JOIN bdms.codelist as lay_uscs_1
                    ON lay_uscs_1.id_cli = uscs_1_id_cli

                LEFT JOIN bdms.codelist as lay_cohesion
                    ON lay_cohesion.id_cli = cohesion_id_cli

                LEFT JOIN (
                    SELECT
                        id_lay_fk, array_agg(geolcode) as mlpr115
                    FROM
                        bdms.layer_codelist
                    INNER JOIN
                        bdms.codelist
                    ON
                        layer_codelist.id_cli_fk = codelist.id_cli
                    WHERE
                        layer_codelist.code_cli = 'mlpr115'
                    GROUP BY id_lay_fk
                ) ggr
                ON ggr.id_lay_fk = id_lay

                LEFT JOIN (
                    SELECT
                        id_lay_fk, array_agg(geolcode) as mlpr110
                    FROM
                        bdms.layer_codelist
                    INNER JOIN
                        bdms.codelist
                    ON
                        layer_codelist.id_cli_fk = codelist.id_cli
                    WHERE
                        layer_codelist.code_cli = 'mlpr110'
                    GROUP BY id_lay_fk
                ) gsh
                ON gsh.id_lay_fk = id_lay

                LEFT JOIN bdms.codelist as lay_grain_size_2
                    ON lay_grain_size_2.id_cli = grain_size_2_id_cli

                LEFT JOIN bdms.codelist as lay_grain_size_1
                    ON lay_grain_size_1.id_cli = grain_size_1_id_cli

                LEFT JOIN (
                    SELECT
                        id_lay_fk, array_agg(geolcode) as mlpr108
                    FROM
                        bdms.layer_codelist
                    INNER JOIN
                        bdms.codelist
                    ON
                        layer_codelist.id_cli_fk = codelist.id_cli
                    WHERE
                        layer_codelist.code_cli = 'mlpr108'
                    GROUP BY id_lay_fk
                ) oco
                ON oco.id_lay_fk = id_lay

                LEFT JOIN bdms.codelist as lay_soil_state
                    ON lay_soil_state.id_cli = soil_state_id_cli

                LEFT JOIN (
                    SELECT
                        id_lay_fk, array_agg(geolcode) as mlpr113
                    FROM
                        bdms.layer_codelist
                    INNER JOIN
                        bdms.codelist
                    ON
                        layer_codelist.id_cli_fk = codelist.id_cli
                    WHERE
                        layer_codelist.code_cli = 'mlpr113'
                    GROUP BY id_lay_fk
                ) jng
                ON jng.id_lay_fk = id_lay

                LEFT JOIN bdms.codelist as lay_compactness
                    ON lay_compactness.id_cli = alteration_id_cli

                LEFT JOIN bdms.codelist as lay_alteration
                    ON lay_alteration.id_cli = alteration_id_cli

                LEFT JOIN bdms.codelist as lay_consistance
                    ON lay_consistance.id_cli = consistance_id_cli

                LEFT JOIN bdms.codelist as lay_gradation
                    ON lay_gradation.id_cli = gradation_id_cli

                LEFT JOIN bdms.codelist as lay_humidity
                    ON lay_humidity.id_cli = humidity_id_cli

                LEFT JOIN bdms.codelist as lay_plasticity
                    ON lay_plasticity.id_cli = plasticity_id_cli

                LEFT JOIN (
                    SELECT
                        id_lay_fk, array_agg(geolcode) as mlpr112
                    FROM
                        bdms.layer_codelist
                    INNER JOIN
                        bdms.codelist
                    ON
                        layer_codelist.id_cli_fk = codelist.id_cli
                    WHERE
                        layer_codelist.code_cli = 'mlpr112'
                    GROUP BY id_lay_fk
                ) clr
                ON clr.id_lay_fk = id_lay

                LEFT JOIN bdms.codelist as lay_symbol
                    ON lay_symbol.id_cli = symbol_id_cli

                LEFT JOIN bdms.codelist as lay_tectonic_unit
                    ON lay_tectonic_unit.id_cli = tectonic_unit_id_cli

                LEFT JOIN bdms.codelist as lay_chrono_strati
                    ON lay_chrono_strati.id_cli = chronostratigraphy_id_cli

                LEFT JOIN bdms.codelist as lay_qt_desc
                    ON lay_qt_desc.id_cli = qt_description_id_cli

                LEFT JOIN bdms.codelist as lay_lith
                    ON lay_lith.id_cli = lithology_id_cli

                LEFT JOIN bdms.codelist as lay_lith_stra
                    ON lay_lith_stra.id_cli = lithostratigraphy_id_cli

                WHERE
                    primary_sty = True

                ORDER BY
                    depth_from, depth_to

            ) as sty
            ON sty.id_bho_fk = id_bho
            
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

            LEFT JOIN bdms.codelist as qt_tbed_tvd
                ON qt_tbed_tvd.id_cli = qt_top_bedrock_tvd_id_cli

            LEFT JOIN bdms.codelist as qt_tbed
                ON qt_tbed.id_cli = qt_top_bedrock_id_cli

            LEFT JOIN bdms.codelist as qt_len
                ON qt_len.id_cli = qt_depth_id_cli

            LEFT JOIN bdms.codelist as qt_inc_dir
                ON qt_inc_dir.id_cli = qt_inclination_direction_id_cli

            LEFT JOIN bdms.codelist as cut
                ON cut.id_cli = cuttings_id_cli

            LEFT JOIN bdms.municipalities
                ON municipalities.gid = city_bho

            --LEFT JOIN bdms.cantons
            --    ON cantons.kantonsnum = canton_bho

            LEFT JOIN (
                SELECT DISTINCT
                    cantons.kantonsnum,
                    cantons.name
				FROM
                    bdms.cantons
			) as ctn
                ON ctn.kantonsnum = canton_bho

            LEFT JOIN bdms.codelist as knd
                ON knd.id_cli = kind_id_cli

            LEFT JOIN bdms.codelist as qtloc
                ON qtloc.id_cli = qt_location_id_cli

            LEFT JOIN bdms.codelist as srd
                ON srd.id_cli = srs_id_cli

            LEFT JOIN bdms.codelist as hrs
                ON hrs.id_cli = hrs_id_cli

            LEFT JOIN bdms.codelist as qth
                ON qth.id_cli = qt_elevation_id_cli

            LEFT JOIN bdms.codelist as qre
                ON qre.id_cli = qt_reference_elevation_id_cli

            LEFT JOIN bdms.codelist as ret
                ON ret.id_cli = reference_elevation_type_id_cli

            LEFT JOIN bdms.codelist as rest
                ON rest.id_cli = restriction_id_cli

            LEFT JOIN bdms.codelist as meth
                ON meth.id_cli = drilling_method_id_cli

            LEFT JOIN bdms.codelist as prp
                ON prp.id_cli = purpose_id_cli

            LEFT JOIN bdms.codelist as sts
                ON sts.id_cli = status_id_cli
        """
