# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.borehole.codelist import ListCodeList
import math
from io import StringIO
import traceback
import csv


class ExportSimpleCsv(Action):

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

                groundwater_bho as groundwater

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

        cl = await ListCodeList(self.conn).execute('borehole_form')

        csv_header = {}
        for c in cl['data']['borehole_form']:
            csv_header[c['code']] = c

        csvfile = StringIO()

        if len(data) > 0:
            cw = csv.writer(
                csvfile,
                delimiter=';',
                quotechar='"'
            )
            # cols = data[0].keys()
            keys = data[0].keys()
            cols = []
            for key in keys:
                cols.append(
                    csv_header[key][language]['text']
                    if key in csv_header else key
                )

            cw.writerow(cols)

            for row in data:
                r = []
                for col in keys:
                    if isinstance(row[col], list):
                        r.append(",".join(str(x) for x in row[col]))
                    else:
                        r.append(row[col])
                cw.writerow(r)

        return csvfile
