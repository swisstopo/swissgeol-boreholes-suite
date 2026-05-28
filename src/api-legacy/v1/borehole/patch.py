# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.exceptions import (
    PatchAttributeException
)
from bms.v1.exceptions import Locked


class PatchBorehole(Action):

    @staticmethod
    def get_column(field):
        column = None

        if field == 'extended.original_name':
            column = 'original_name'

        elif field == 'visible':
            column = 'public'

        elif field == 'custom.alternate_name':
            column = 'name'

        elif field == 'custom.project_name':
            column = 'project_name'

        elif field == 'workgroup':
            column = 'workgroup_id'

        elif field in [ 'location_x',
                        'location_y',
                        'location_x_lv03',
                        'location_y_lv03',
                        'location',
                        'precision_location_x',
                        'precision_location_y',
                        'precision_location_x_lv03',
                        'precision_location_y_lv03']:

            if field == 'location_x':
                column = 'location_x'

            elif field == 'location_y':
                column = 'location_y'

            elif field == 'location_x_lv03':
                column = 'location_x_lv03'

            elif field == 'location_y_lv03':
                column = 'location_y_lv03'

            elif field == 'precision_location_x':
                column = 'precision_location_x'

            elif field == 'precision_location_y':
                column = 'precision_location_y'

            elif field == 'precision_location_x_lv03':
                column = 'precision_location_x_lv03'

            elif field == 'precision_location_y_lv03':
                column = 'precision_location_y_lv03'

            elif field == 'location':
                column = [
                    'location_x',
                    'location_y',
                    'elevation_z',
                    'country',
                    'canton',
                    'municipality',
                ]

        elif field == 'elevation_z':
            column = 'elevation_z'

        elif field == 'custom.canton':
            column = 'canton'

        elif field == 'custom.city':
            column = 'city_bho'

        elif field == 'canton':
            column = 'canton_num'

        elif field == 'total_depth':
            column = 'total_depth'

        elif field == 'extended.top_bedrock_fresh_md':
            column = 'top_bedrock_fresh_md'

        elif field == 'extended.groundwater':
            column = 'groundwater'

        elif field == 'custom.mistakes':
            column = 'mistakes_bho'

        elif field == 'custom.remarks':
            column = 'remarks'

        elif field == 'restriction_until':
            column = 'restriction_until'

        elif field == 'restriction':
            column = 'restriction_id'

        elif field == 'national_interest':
            column = 'national_interest'

        elif field == 'borehole_type':
            column = 'borehole_type_id'

        elif field == 'spatial_reference_system':
            column = 'srs_id'

        elif field == 'location_precision':
            column = 'precision_location_id'

        elif field == 'elevation_precision':
            column = 'precision_elevation_id'

        elif field == 'reference_elevation':
            column = 'reference_elevation'

        elif field == 'qt_reference_elevation':
            column = 'precision_reference_elevation_id'

        elif field == 'reference_elevation_type':
            column = 'reference_elevation_type_id'

        elif field == 'height_reference_system':
            column = 'hrs_id'

        elif field == 'extended.purpose':
            column = 'purpose_id'

        elif field == 'extended.status':
            column = 'status_id'

        elif field == 'custom.qt_depth':
            column = 'precision_depth_id'

        elif field == 'depth_precision':
            column = 'precision_depth_id'

        elif field == 'custom.top_bedrock_weathered_md':
            column = 'top_bedrock_weathered_md'

        elif field == 'lithology_con':
            column = 'lithology_top_bedrock_id'

        elif field == 'lithostratigraphy':
            column = 'lithostratigraphy_top_bedrock_id'

        elif field == 'chronostratigraphy':
            column = 'chronostratigraphy_top_bedrock_id'

        if column is None:
            raise PatchAttributeException(
                "Attribute '{}' not found".format(field)
            )

        return column


    async def execute(self, id, field, value, user):
        try:

            column = PatchBorehole.get_column(field)

            # Updating character varing, numeric, boolean fields
            if field in [
                'visible',
                'extended.original_name',
                'custom.alternate_name',
                'custom.project_name',
                'national_interest',
                'location',
                'location_x',
                'location_y',
                'location_x_lv03',
                'location_y_lv03',
                'precision_location_x',
                'precision_location_y',
                'precision_location_x_lv03',
                'precision_location_y_lv03',
                'elevation_z',
                'country',
                'canton',
                'municipality',
                'depth_precision',
                'drill_diameter',
                'custom.drill_diameter',
                'total_depth',
                'extended.top_bedrock_fresh_md',
                'custom.top_bedrock_weathered_md',
                'extended.groundwater',
                'custom.mistakes',
                'custom.remarks',
                'reference_elevation',
                'workgroup',
            ]:

                if isinstance(column, list):
                    sets = []
                    for col in column:
                        sets.append("%s = %s" % (col, self.getIdx()))
                    value.append(user['id'])
                    value.append(id)
                    await self.conn.execute("""
                        UPDATE bdms.borehole
                        SET
                            %s,
                            "update" = now(),
                            updater = %s
                        WHERE id = %s
                    """ % (
                        ", ".join(sets),
                        self.getIdx(),
                        self.getIdx()
                    ), *value)

                else:
                    await self.conn.execute("""
                        UPDATE bdms.borehole
                        SET
                            %s = $1,
                            "update" = now(),
                            updater = $2
                        WHERE id = $3
                    """ % column, value, user['id'], id)


            # Datetime values
            elif field in [
                'restriction_until',
                'drilling_date',
                'spud_date'
            ]:

                if value == '':
                    value = None

                await self.conn.execute("""
                    UPDATE bdms.borehole
                    SET
                        %s = to_date($1, 'YYYY-MM-DD'),
                        "update" = now(),
                        updater = $2
                    WHERE id = $3
                """ % column, value, user['id'], id)

            elif field in [
                'restriction',
                'borehole_type',
                'spatial_reference_system',
                'location_precision',
                'elevation_precision',
                'height_reference_system',
                'custom.landuse',
                'extended.drilling_method',
                'custom.cuttings',
                'extended.purpose',
                'extended.status',
                'custom.qt_depth',
                'custom.processing_status',
                'lithology_con',
                'lithostratigraphy',
                'chronostratigraphy',
                'qt_reference_elevation',
                'reference_elevation_type',
            ]:

                schema = field

                if field == 'lithology_con':
                    schema = 'lithology_con'

                elif field == 'lithostratigraphy':
                    schema = 'lithostratigraphy'

                elif field == 'chronostratigraphy':
                    schema = 'chronostratigraphy'

                elif field == 'qt_reference_elevation':
                    schema = 'elevation_precision'

                elif field == 'reference_elevation_type':
                    schema = 'reference_elevation_type'

                elif field == 'custom.qt_depth':
                    schema = 'depth_precision'

                # Check if domain is extracted from the correct schema
                if value is not None and schema != (
                    await self.conn.fetchval("""
                        SELECT
                            schema
                        FROM
                            bdms.codelist
                        WHERE
                            id = $1
                    """, value)
                ):
                    raise Exception(
                        "Attribute id %s not part of schema %s" %
                        (
                            value, schema
                        )
                    )

                await self.conn.execute("""
                    UPDATE bdms.borehole
                    SET
                        %s = $1,
                        "update" = now(),
                        updater = $2
                    WHERE id = $3
                """ % column, value, user['id'], id)

            else:
                raise PatchAttributeException(field)

            rec = await self.conn.fetchval("""
                SELECT
                    row_to_json(t2)
                FROM (
                    SELECT
                        (
                            SELECT row_to_json(t)
                            FROM (
                                SELECT
                                    borehole.locked_by as id,
                                    locker.username as username,
                                    locker.firstname || ' ' || locker.lastname
                                        as fullname,
                                    to_char(
                                        borehole.locked,
                                        'YYYY-MM-DD"T"HH24:MI:SSOF'
                                    ) as date
                            ) AS t
                        ) as lock,
                        (
                            select row_to_json(t)
                            FROM (
                                SELECT
                                    updater.id as id,
                                    updater.username as username,
                                    updater.firstname || ' ' || updater.lastname
                                        as fullname,
                                    to_char(
                                        borehole."update",
                                        'YYYY-MM-DD"T"HH24:MI:SSOF'
                                    ) as date
                            ) t
                        ) as updater
                    FROM
                        bdms.borehole
                    INNER JOIN bdms.users as locker
                        ON locked_by = locker.id
                    INNER JOIN bdms.users as updater
                        ON borehole.updater = updater.id
                    WHERE
                        borehole.id = $1
                ) t2
            """, id)

            if rec is not None:
                return self.decode(rec)

            return None

        except PatchAttributeException as bmsx:
            raise bmsx

        except Locked as lkd:
            raise lkd

        except Exception:
            raise Exception("Error while updating borehole")
