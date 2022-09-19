# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.borehole import ListBorehole
from bms.v1.borehole.codelist import ListCodeList
import math
from io import BytesIO
import traceback
import shapefile


class ExportShapefile(Action):

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
            {}
            WHERE geom_bho IS NOT NULL
        """.format(
            ListBorehole.get_sql_text(language)
        )

        if len(where) > 0:
            sql += """
                AND %s
            """ % " AND ".join(where)

        if permissions is not None:
            sql += f"""
                AND {permissions}
            """

        # recs = await self.conn.fetch(sql, *(params))

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

        if len(data) > 0:

            cl = await ListCodeList(self.conn).execute('borehole_form')

            shp_header = {}
            for c in cl['data']['borehole_form']:
                shp_header[c['code']] = c

            identifiers = await ListCodeList(
                self.conn
            ).execute('borehole_identifier')

            for c in identifiers['data']['borehole_identifier']:
                shp_header[c['code']] = c

            shp = BytesIO()
            shx = BytesIO()
            dbf = BytesIO()

            w = shapefile.Writer(
                shp=shp, shx=shx, dbf=dbf, encoding="utf8"
            )

            keys = data[0].keys()
            for key in keys:
                # Excluding identifiers column and coordinates

                if key in [
                    'location_x',
                    'location_y',
                    'identifiers'
                ]:
                    continue

                w.field(
                    (
                        shp_header[key][language]['text']
                        if key in shp_header
                        else key
                    ).upper(), 'C'
                )

            extra_col = []
            for identifier in identifiers['data']['borehole_identifier']:
                extra_col.append(
                    identifier[language]['text']
                )

                w.field(
                    identifier[language]['text'].upper(), 'C'
                )

            for row in data:
                r = []
                w.point(row['location_x'], row['location_y']) 

                for col in keys:
                    if col in [
                        'location_x',
                        'location_y'
                    ]:
                        continue

                    if col == 'identifiers':
                        for xc in extra_col:
                            val = None
                            if row[col] is not None:
                                for identifier in row[col]:
                                    if identifier[
                                        'borehole_identifier'
                                    ] ==  xc:
                                        val =  identifier[
                                            'identifier_value'
                                        ]
                                        break
                            
                            r.append(val)

                    else:
                        if isinstance(row[col], list):
                            r.append(",".join(str(x) for x in row[col]))
                        else:
                            r.append(row[col])

                w.record(*r)

            # Go to: https://spatialreference.org/  < is this wrong?
            # Then download the ESRI WKT epsg.
            # prj = BytesIO(
            #     b'PROJCS["CH1903+ / LV95",GEOGCS["CH1903+",DATUM["D_CH1903",' \
            #     b'SPHEROID["Bessel_1841",6377397.155,299.1528128]],PRIMEM["G' \
            #     b'reenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTI' \
            #     b'ON["Hotine_Oblique_Mercator_Azimuth_Center"],PARAMETER["la' \
            #     b'titude_of_center",46.95240555555556],PARAMETER["longitude_' \
            #     b'of_center",7.439583333333333],PARAMETER["azimuth",90],PARA' \
            #     b'METER["scale_factor",1],PARAMETER["false_easting",2600000]' \
            #     b',PARAMETER["false_northing",1200000],UNIT["Meter",1]]'
            # )

            # Used QGIS example
            
            prj = BytesIO(
                b'PROJCS["CH1903+_LV95",GEOGCS["GCS_CH1903+",DATUM["D_CH1903' \
                b'+",SPHEROID["Bessel_1841",6377397.155,299.1528128]],PRIMEM' \
                b'["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJE' \
                b'CTION["Hotine_Oblique_Mercator_Azimuth_Center"],PARAMETER[' \
                b'"False_Easting",2600000.0],PARAMETER["False_Northing",1200' \
                b'000.0],PARAMETER["Scale_Factor",1.0],PARAMETER["Azimuth",9' \
                b'0.0],PARAMETER["Longitude_Of_Center",7.43958333333333],PAR' \
                b'AMETER["Latitude_Of_Center",46.9524055555556],UNIT["Meter"' \
                b',1.0]]'
            )

        return shp, shx, dbf, prj
