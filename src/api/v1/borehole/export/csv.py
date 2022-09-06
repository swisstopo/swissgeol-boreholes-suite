# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.borehole import ListBorehole
from bms.v1.borehole.codelist import ListCodeList
import math
from io import StringIO
import traceback
import csv


class ExportCsv(Action):

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

        sql = ListBorehole.get_sql_text(language)

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
            for identifier in identifiers['data']['borehole_identifier']:
                extra_col.append(
                    identifier[language]['text']
                )

            cw.writerow(cols + extra_col)

            for row in data:
                r = []
                for col in keys:
                    if col == 'identifiers':
                        for xc in extra_col:
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
