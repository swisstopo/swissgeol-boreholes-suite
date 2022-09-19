# -*- coding: utf-8 -*-
import csv
from bms.v1.action import Action

from bms.v1.borehole.create import CreateBorehole
from bms.v1.borehole.patch import PatchBorehole
from bms.v1.borehole.check import CheckBorehole

"""

The CSV file shall have this structure, without the header:

location_east;location_north;original_name;alternate_name;project_name;elevation_z;drillend_date;total_depth;top_bedrock;remarks
2719603;1081038.5;"test001";"foo";"bar";"foobar";273.7;"2020-06-16";28.2;18.7;"lorem ipsum"
2719603;1081038.5;"test002";"foo";"bar";"foobar";273.7;"2020-06-16";28.2;18.7;"lorem ipsum"
2719603;1081038.5;"test002";"foo";"bar";"foobar";273.7;"2020-06-16";28.2;18.7;"lorem ipsum"

"""

class ImportCsv(Action):

    mandatory_columns = [
        "location_east",
        "location_north",
        "alternate_name"
    ]

    async def execute(self, file, id, user):

        check = CheckBorehole(self.conn)
        reader = csv.reader(file, delimiter=';', quotechar='"')
        rows = list(reader)
        line = 1

        # Check optional / mandatory columns

        columns = {
            "location_east": {
                "col_num": None,
                "field": "location_x"
            },
            "location_north": {
                "col_num": None,
                "field": "location_y"
            },
            "elevation_z": {
                "col_num": None,
                "field": "elevation_z"
            },
            "alternate_name": {
                "col_num": None,
                "field": "custom.alternate_name"
            },
            "original_name": {
                "col_num": None,
                "field": "extended.original_name"
            },
            "project_name": {
                "col_num": None,
                "field": "custom.project_name"
            },
            "drillend_date": {
                "col_num": None,
                "field": "drilling_date"
            },
            "total_depth": {
                "col_num": None,
                "field": "length"
            },
            "top_bedrock": {
                "col_num": None,
                "field": "extended.top_bedrock"
            },
            "remarks": {
                "col_num": None,
                "field": "custom.remarks"
            }
        }

        keys = columns.keys()

        for index, column in enumerate(rows[0]):
            if column in keys:
                # Check if already set (duplicate columns error)
                if columns[column]['col_num'] is not None:
                    raise Exception(f"Duplicate column '{column}' found.")

                columns[column]['col_num'] = index

        # Check mandatory columns
        for column in self.mandatory_columns:
            if columns[column]['col_num'] is None:
                mc = ','.join(self.mandatory_columns)
                raise Exception(
                    f"Missing one or more mandatory columns ({mc})"
                )

        try:
            await self.conn.execute("BEGIN;")

            # Skipping header
            for row in rows[1:]:
                line += 1

                location_x = float(row[columns['location_east']['col_num']])
                location_y = float(row[columns['location_north']['col_num']])

                if (
                    location_x < 2485869.5728 or
                    location_x > 2837076.5648
                ) or (
                    location_y < 1076443.1884 or
                    location_y > 1299941.7864
                ):
                    raise Exception(
                        f"Line {line}: coordinates outside Switzerland"
                    )

                # Check borehole original_name duplicates
                if columns['original_name']['col_num'] is not None:
                    original_name = row[columns['original_name']['col_num']]
                    data = await check.execute(
                        'extended.original_name',
                        original_name
                    )
                    if data['check'] is False:
                        raise Exception(
                            f'Line {line}: Borehole "{original_name}" already exists'
                        )

            create = CreateBorehole(self.conn)
            patch = PatchBorehole(self.conn)

            for row in rows[1:]:

                # Creating a new borehole
                bid = await create.execute(id, user)

                for column in columns:

                    # Get user defined column index
                    col_num = columns[column]['col_num']

                    if col_num is not None:

                        value = None
                        field = columns[column]['field']

                        # Cast numeric values to float
                        if column in [
                            'location_east',
                            'location_north',
                            'elevation_z',
                            'top_bedrock',
                            'total_depth'
                        ]:
                            value = float(row[col_num])

                        else:
                            value = row[col_num]

                        # Patch borehole
                        await patch.execute(
                            bid['id'], field, value, user
                        )

            await self.conn.execute("COMMIT;")

        except Exception as ex:
            await self.conn.execute("ROLLBACK;")
            raise ex

        return None
