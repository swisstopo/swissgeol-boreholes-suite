# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.exceptions import (
    PatchAttributeException
)
from bms.v1.borehole.geom.patch import PatchGeom
from bms.v1.exceptions import Locked


class PatchBorehole(Action):

    @staticmethod
    def get_column(field):
        column = None
        
        if field == 'extended.original_name':
            column = 'original_name_bho'

        elif field == 'visible':
            column = 'public_bho'

        elif field == 'custom.alternate_name':
            column = 'alternate_name_bho'

        elif field == 'custom.project_name':
            column = 'project_name_bho'
        
        elif field == 'workgroup':
            column = 'id_wgp_fk'

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
                column = 'location_x_bho'

            elif field == 'location_y':
                column = 'location_y_bho'
            
            elif field == 'location_x_lv03':
                column = 'location_x_lv03_bho'

            elif field == 'location_y_lv03':
                column = 'location_y_lv03_bho'

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
                    'location_x_bho',
                    'location_y_bho',
                    'elevation_z_bho',
                    'country_bho',
                    'canton_bho',
                    'municipality_bho',
                ]

        elif field == 'elevation_z':
            column = 'elevation_z_bho'

        elif field == 'custom.canton':
            column = 'canton_bho'

        elif field == 'custom.city':
            column = 'city_bho'

        elif field == 'canton':
            column = 'canton_num'

        elif field == 'custom.drill_diameter':
            column = 'drilling_diameter_bho'

        elif field == 'inclination':
            column = 'inclination_bho'

        elif field == 'inclination_direction':
            column = 'inclination_direction_bho'

        elif field == 'total_depth':
            column = 'total_depth_bho'

        elif field == 'total_depth_tvd':
            column = 'total_depth_tvd_bho'

        elif field == 'qt_total_depth_tvd':
            column = 'qt_total_depth_tvd_id_cli'

        elif field == 'extended.top_bedrock':
            column = 'top_bedrock_bho'

        elif field == 'extended.top_bedrock_tvd':
            column = 'top_bedrock_tvd_bho'

        elif field == 'extended.groundwater':
            column = 'groundwater_bho'

        elif field == 'custom.mistakes':
            column = 'mistakes_bho'

        elif field == 'custom.remarks':
            column = 'remarks_bho'

        elif field == 'restriction_until':
            column = 'restriction_until_bho'

        elif field == 'drilling_date':
            column = 'drilling_date_bho'

        elif field == 'spud_date':
            column = 'spud_date_bho'

        elif field == 'restriction':
            column = 'restriction_id_cli'

        elif field == 'national_interest':
            column = 'national_interest'

        elif field == 'borehole_type':
            column = 'kind_id_cli'

        elif field == 'spatial_reference_system':
            column = 'srs_id_cli'

        elif field == 'location_precision':
            column = 'qt_location_id_cli'

        elif field == 'elevation_precision':
            column = 'qt_elevation_id_cli'

        elif field == 'reference_elevation':
            column = 'reference_elevation_bho'

        elif field == 'qt_reference_elevation':
            column = 'qt_reference_elevation_id_cli'

        elif field == 'reference_elevation_type':
            column = 'reference_elevation_type_id_cli'

        elif field == 'height_reference_system':
            column = 'hrs_id_cli'

        elif field == 'extended.drilling_method':
            column = 'drilling_method_id_cli'

        elif field == 'custom.cuttings':
            column = 'cuttings_id_cli'

        elif field == 'extended.purpose':
            column = 'purpose_id_cli'

        elif field == 'extended.status':
            column = 'status_id_cli'

        elif field == 'custom.qt_bore_inc_dir':
            column = 'qt_inclination_direction_id_cli'

        elif field == 'custom.qt_depth':
            column = 'qt_depth_id_cli'

        elif field == 'custom.qt_top_bedrock':
            column = 'qt_top_bedrock'

        elif field == 'custom.qt_top_bedrock_tvd':
            column = 'qt_top_bedrock_tvd'

        elif field == 'custom.lithology_top_bedrock':
            column = 'lithology_top_bedrock_id_cli'

        elif field == 'custom.lithostratigraphy_top_bedrock':
            column = 'lithostrat_id_cli'

        elif field == 'custom.chronostratigraphy_top_bedrock':
            column = 'chronostrat_id_cli'

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
                'country_bho',
                'canton_bho',
                'municipality_bho',
                'drill_diameter',
                'custom.drill_diameter',
                'inclination',
                'inclination_direction',
                'total_depth',
                'total_depth_tvd',
                'extended.top_bedrock',
                'extended.top_bedrock_tvd',
                'custom.qt_top_bedrock',
                'custom.qt_top_bedrock_tvd',
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
                            updated_bho = now(),
                            updated_by_bho = %s
                        WHERE id_bho = %s
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
                            updated_bho = now(),
                            updated_by_bho = $2
                        WHERE id_bho = $3
                    """ % column, value, user['id'], id)
                
                if field in ['location_x', 'location_y', 'location']:

                    geom = PatchGeom(self.conn)
                    await geom.execute(id, field, value)

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
                        updated_bho = now(),
                        updated_by_bho = $2
                    WHERE id_bho = $3
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
                'custom.qt_bore_inc_dir',
                'custom.qt_depth',
                'custom.processing_status',
                'custom.lithology_top_bedrock',
                'custom.lithostratigraphy_top_bedrock',
                'custom.chronostratigraphy_top_bedrock',
                'qt_reference_elevation',
                'reference_elevation_type',
                'qt_total_depth_tvd'
            ]:

                schema = field

                if field == 'custom.lithology_top_bedrock':
                    schema = 'custom.lithology_top_bedrock'

                elif field == 'custom.lithostratigraphy_top_bedrock':
                    schema = 'custom.lithostratigraphy_top_bedrock'

                elif field == 'custom.chronostratigraphy_top_bedrock':
                    schema = 'custom.chronostratigraphy_top_bedrock'

                elif field == 'custom.qt_top_bedrock_tvd':
                    schema = 'custom.qt_top_bedrock'

                elif field == 'qt_reference_elevation':
                    schema = 'elevation_precision'

                elif field == 'reference_elevation_type':
                    schema = 'reference_elevation_type'

                elif field == 'qt_total_depth_tvd':
                    schema = 'custom.qt_top_bedrock'
                
                elif field == 'custom.qt_depth':
                    schema = 'custom.qt_top_bedrock'

                # Check if domain is extracted from the correct schema
                if value is not None and schema != (
                    await self.conn.fetchval("""
                        SELECT
                            schema_cli
                        FROM
                            bdms.codelist
                        WHERE
                            id_cli = $1
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
                        updated_bho = now(),
                        updated_by_bho = $2
                    WHERE id_bho = $3
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
                                    borehole.locked_by_bho as id,
                                    locker.username as username,
                                    locker.firstname || ' ' || locker.lastname
                                        as fullname,
                                    to_char(
                                        borehole.locked_bho,
                                        'YYYY-MM-DD"T"HH24:MI:SSOF'
                                    ) as date
                            ) AS t
                        ) as lock,
                        (
                            select row_to_json(t)
                            FROM (
                                SELECT
                                    updater.id_usr as id,
                                    updater.username as username,
                                    updater.firstname || ' ' || updater.lastname
                                        as fullname,
                                    to_char(
                                        updated_bho,
                                        'YYYY-MM-DD"T"HH24:MI:SSOF'
                                    ) as date
                            ) t
                        ) as updater
                    FROM
                        bdms.borehole
                    INNER JOIN bdms.users as locker
                        ON locked_by_bho = locker.id_usr
                    INNER JOIN bdms.users as updater
                        ON updated_by_bho = updater.id_usr
                    WHERE
                        borehole.id_bho = $1
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
