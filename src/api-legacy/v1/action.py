# -*- coding: utf-8 -*-
import asyncio
import json
from bms import (
    PUBLIC,
    EDIT
)


class Action():

    lock_timeout = 60

    def __init__(self, conn=None, pool=None):
        self.conn = conn
        self.pool = pool
        self.idx = 0

    def decode(self, text, nullValue=None):
        if text is None:
            return nullValue
        return json.loads(text)

    def run_until_complete(self, tasks):
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(
            asyncio.wait(
                [loop.create_task(x) for x in tasks]
            )
        )

    async def execute(self, *arg, **args):
        pass

    def getIdx(self):
        self.idx += 1
        return "$%s" % self.idx

    def getordering(self, orderby, direction):
        _orderby = 'original_name_bho'
        if orderby == 'original_name':
            _orderby = 'original_name_bho'

        if orderby == 'alternate_name':
            _orderby = 'alternate_name_bho'

        elif orderby == 'restriction':
            _orderby = 'restriction_id_cli'

        elif orderby == 'elevation_z':
            _orderby = 'elevation_z_bho'

        elif orderby == 'length':
            _orderby = 'total_depth'

        elif orderby == 'borehole_type':
            _orderby = 'borehole_type_id'

        elif orderby == 'restriction_until':
            _orderby = 'restriction_until_bho'

        elif orderby == 'national_interest':
            orderby = 'national_interest'

        elif orderby == 'status':
            _orderby = 'status_id_cli'

        elif orderby == 'creator':
            _orderby = 'created_by_bho'

        elif orderby == 'creation':
            _orderby = 'created_bho'

        elif orderby == 'workgroup':
            _orderby = 'id_wgp_fk'

        elif orderby == 'purpose':
            _orderby = 'purpose_id_cli'

        elif orderby == 'elevation_z':
            _orderby = 'elevation_z_bho'

        # there are inconsitencies in the client code, that sometimes the translation key is send to the api. Therefore some duplicate keys are mapped here.
        elif orderby == 'boreholestatus':
            _orderby = 'status_id_cli'

        elif orderby == 'createdBy':
            _orderby = 'created_by_bho'

        elif orderby == 'creationdate':
            _orderby = 'created_bho'

        elif orderby == 'totaldepth':
            _orderby = 'total_depth'

        elif orderby == 'total_depth':
            _orderby = 'total_depth'

        elif orderby == 'reference_elevation':
            _orderby = 'reference_elevation_bho'

        elif orderby == 'top_bedrock_fresh_md':
            _orderby = 'top_bedrock_fresh_md'

        else:
            orderby = 'original_name'

        if direction not in ['DESC', 'ASC']:
            direction = 'ASC'

        return _orderby, direction

    def filterPermission(self, user, exclude=[]):

        where = []

        roles = user['roles'].copy()
        if len(exclude) > 0:
            for role in exclude:
                if role in roles:
                    roles.pop(
                        roles.index(role)
                    )

        # If user is a viewer then he/she can see all published boreholes
        if user['viewer'] is True:
            where.append(f"""
                borehole.public_bho IS TRUE
            """)

        # If the user belongs to a workgroups then he can see all
        # the belonging boreholes with his role active
        if user['workgroups'] not in ['', None]:
            for workgroup in user['workgroups']:

                # User can see not finished data belonging to his workgroups
                where.append(f"""
                    id_wgp_fk = {workgroup['id']}
                """)

        return '({})'.format(
            ' OR '.join(where)
        )

    def filterProfileLayers(self, filter={}):

        params = []
        where = []
        joins = []

        keys = filter.keys()


        key_to_table_column = {
            'grain_shape': {'table': 'bdms.layer_grain_shape_codelist', 'column': 'grain_shape_id'},
            'grain_granularity': {'table': 'bdms.layer_grain_angularity_codelist', 'column': 'grain_angularity_id'},
            'organic_component': {'table': 'bdms.layer_organic_component_codelist', 'column': 'organic_components_id'},
            'debris': {'table': 'bdms.layer_debris_codelist', 'column': 'debris_id'},
            'color': {'table': 'bdms.layer_color_codelist', 'column': 'color_id'},
            'uscs_3': {'table': 'bdms.layer_uscs3_codelist', 'column': 'uscs3_id'}
        }

        for key, value in key_to_table_column.items():
            if key in keys and filter[key] not in ['', None]:
                params.append(filter[key])
                joins.append(f"""
                    INNER JOIN (
                        SELECT DISTINCT
                            layer_id
                        FROM
                            {value['table']}
                        WHERE
                            {value['column']} = %s
                    ) {key}
                    ON {key}.layer_id= id_lay
                """ % self.getIdx())

        if 'layer_lithology_top_bedrock' in keys and filter['layer_lithology_top_bedrock'] not in ['', None]:
            params.append(filter['layer_lithology_top_bedrock'])
            where.append("""
                layer.lithology_top_bedrock_id_cli = %s
            """ % self.getIdx())

        if 'uscs_1' in keys and filter['uscs_1'] not in ['', None]:
            params.append(filter['uscs_1'])
            where.append("""
                uscs_1_id_cli = %s
            """ % self.getIdx())

        if 'uscs_2' in keys and filter['uscs_2'] not in ['', None]:
            params.append(filter['uscs_2'])
            where.append("""
                uscs_2_id_cli = %s
            """ % self.getIdx())

        if 'uscs_determination' in keys and filter['uscs_determination'] not in ['', None]:
            params.append(filter['uscs_determination'])
            where.append("""
                uscs_determination_id_cli = %s
            """ % self.getIdx())

        if 'uscs_original' in keys and filter['uscs_original'] not in ['', None]:
            params.append(f"%{filter['uscs_original']}%")
            where.append("""
                uscs_original_lay ILIKE %s
            """ % self.getIdx())

        if 'original_lithology' in keys and filter['original_lithology'] not in ['', None]:
            params.append(f"%{filter['original_lithology']}%")
            where.append("""
                original_lithology ILIKE %s
            """ % self.getIdx())

        if 'layer_borehole' in keys and filter['layer_borehole'] not in ['', None]:
            params.append(filter['layer_borehole'])
            where.append("""
                stratigraphy.id_bho_fk = %s
            """ % self.getIdx())

        if 'layer_depth_from' in keys and filter['layer_depth_from'] not in ['', None]:
            params.append(float(filter['layer_depth_from']))
            where.append("""
                depth_to_lay > %s
            """ % self.getIdx())

        if 'layer_depth_to' in keys and filter['layer_depth_to'] not in ['', None]:
            params.append(float(filter['layer_depth_to']))
            where.append("""
                depth_from_lay < %s
            """ % self.getIdx())

        if 'layer_depth_from_from' in keys and filter['layer_depth_from_from'] not in ['', None]:
            params.append(float(filter['layer_depth_from_from']))
            where.append("""
                depth_from_lay >= %s
            """ % self.getIdx())

        if 'layer_depth_from_to' in keys and filter['layer_depth_from_to'] not in ['', None]:
            params.append(float(filter['layer_depth_from_to']))
            where.append("""
                depth_from_lay <= %s
            """ % self.getIdx())

        if 'layer_depth_to_from' in keys and filter['layer_depth_to_from'] not in ['', None]:
            params.append(float(filter['layer_depth_to_from']))
            where.append("""
                depth_to_lay >= %s
            """ % self.getIdx())

        if 'layer_depth_to_to' in keys and filter['layer_depth_to_to'] not in ['', None]:
            params.append(float(filter['layer_depth_to_to']))
            where.append("""
                depth_to_lay <= %s
            """ % self.getIdx())

        if 'lithology' in keys and filter['lithology'] not in ['', None]:
            params.append(filter['lithology'])
            where.append("""
                lithology_id_cli = %s
            """ % self.getIdx())

        if 'lithostratigraphy' in keys and filter['lithostratigraphy'] not in ['', None]:
            params.append(filter['lithostratigraphy'])
            where.append("""
                lithostratigraphy_id_cli = %s
            """ % self.getIdx())

        if 'plasticity' in keys and filter['plasticity'] not in ['', None]:
            params.append(filter['plasticity'])
            where.append("""
                plasticity_id_cli = %s
            """ % self.getIdx())

        if 'humidity' in keys and filter['humidity'] not in ['', None]:
            params.append(filter['humidity'])
            where.append("""
                humidity_id_cli = %s
            """ % self.getIdx())

        if 'consistance' in keys and filter['consistance'] not in ['', None]:
            params.append(filter['consistance'])
            where.append("""
                consistance_id_cli = %s
            """ % self.getIdx())

        if 'layer_gradation' in keys and filter['layer_gradation'] not in ['', None]:
            params.append(filter['layer_gradation'])
            where.append("""
                gradation_id_cli = %s
            """ % self.getIdx())

        if 'alteration' in keys and filter['alteration'] not in ['', None]:
            params.append(filter['alteration'])
            where.append("""
                alteration_id_cli = %s
            """ % self.getIdx())

        if 'compactness' in keys and filter['compactness'] not in ['', None]:
            params.append(filter['compactness'])
            where.append("""
                compactness_id_cli = %s
            """ % self.getIdx())

        if 'striae' in keys and filter['striae'] != -1:
            if filter['striae'] == None:
                where.append("""
                    striae_lay IS NULL
                """)
            else:
                params.append(filter['striae'])
                where.append("""
                    striae_lay = %s
                """ % self.getIdx())

        if 'grain_size_1' in keys and filter['grain_size_1'] not in ['', None]:
            params.append(filter['grain_size_1'])
            where.append("""
                grain_size_1_id_cli = %s
            """ % self.getIdx())

        if 'grain_size_2' in keys and filter['grain_size_2'] not in ['', None]:
            params.append(filter['grain_size_2'])
            where.append("""
                grain_size_2_id_cli = %s
            """ % self.getIdx())

        if 'cohesion' in keys and filter['cohesion'] not in ['', None]:
            params.append(filter['cohesion'])
            where.append("""
                cohesion_id_cli = %s
            """ % self.getIdx())

        if 'description_quality' in keys and filter['description_quality'] not in ['', None]:
            params.append(filter['description_quality'])
            where.append("""
                qt_description_id_cli = %s
            """ % self.getIdx())

        return where, params, joins

    def filterBorehole(self, filter={}):
        params = []
        where = []

        keys = filter.keys()

        if 'id' in keys and filter['id'] not in ['', None]:
            _or = []
            for bid in filter['id'].split(','):
                params.append(int(bid))
                _or.append("""
                    borehole.id_bho = %s
                """ % self.getIdx())
            where.append("(%s)" % " OR ".join(_or))

        else:
            if (
                'role' in keys and
                filter['role'] not in ['', None] and
                filter['role'] != 'all'
            ):
                params.append(filter['role'])
                where.append("""
                    status[
                        array_length(status, 1)
                    ]  ->> 'role' = %s
                """ % self.getIdx())

            if (
                'workgroup' in keys and
                filter['workgroup'] not in ['', None]
                and filter['workgroup'] != 'all'
            ):
                params.append(filter['workgroup'])
                where.append("""
                    id_wgp_fk = %s
                """ % self.getIdx())

            if 'borehole_identifier' in keys:
                if filter['borehole_identifier'] == 0:
                    if 'identifier_value' in keys and filter['identifier_value'] not in ['', None]:
                        params.append(int(filter['identifier_value']))
                        where.append("""
                            borehole.id_bho = %s
                        """ % self.getIdx())

                elif filter['borehole_identifier'] != None:
                    params.append(int(filter['borehole_identifier']))
                    where.append("""
                        borehole.id_bho IN (SELECT borehole_id FROM bdms.borehole_identifiers_codelist WHERE identifier_id = %s)
                    """ % self.getIdx())

                    if 'identifier_value' in keys and filter['identifier_value'] not in ['', None]:
                        params.append("%%%s%%" % filter['identifier_value'])
                        where.append("""
                            borehole.id_bho IN (SELECT borehole_id FROM bdms.borehole_identifiers_codelist WHERE identifier_value ILIKE %s)
                        """ % self.getIdx())

            if 'identifier' in keys and filter['identifier'] not in ['', None]:
                if filter['identifier'] == '$null':
                    where.append("""
                        original_name_bho IS NULL
                    """)
                else:
                    params.append("%%%s%%" % filter['identifier'])
                    where.append("""
                        original_name_bho ILIKE %s
                    """ % self.getIdx())

            if 'original_name' in keys and filter['original_name'] not in ['', None]:
                if filter['original_name'] == '$null':
                    where.append("""
                        original_name_bho IS NULL
                    """)
                else:
                    params.append("%%%s%%" % filter['original_name'])
                    where.append("""
                        original_name_bho ILIKE %s
                    """ % self.getIdx())

            if 'alternate_name' in keys and filter['alternate_name'] not in ['', None]:
                if filter['alternate_name'] == '$null':
                    where.append("""
                        alternate_name_bho IS NULL
                    """)
                else:
                    params.append("%%%s%%" % filter['alternate_name'])
                    where.append("""
                        alternate_name_bho ILIKE %s
                    """ % self.getIdx())

            if 'project_name' in keys and filter['project_name'] not in ['', None]:
                if filter['project_name'] == '$null':
                    where.append("""
                        project_name_bho IS NULL
                    """)
                else:
                    params.append("%%%s%%" % filter['project_name'])
                    where.append("""
                        project_name_bho ILIKE %s
                    """ % self.getIdx())

            if 'borehole_type' in keys and filter['borehole_type'] not in ['', None]:
                params.append(int(filter['borehole_type']))
                where.append("""
                    borehole_type_id = %s
                """ % self.getIdx())

            if 'restriction' in keys and filter[
                    'restriction'] not in ['', None]:
                params.append(int(filter['restriction']))
                where.append("""
                    restriction_id_cli = %s
                """ % self.getIdx())

            if 'status' in keys and filter[
                    'status'] not in ['', None]:
                params.append(int(filter['status']))
                where.append("""
                    status_id_cli = %s
                """ % self.getIdx())

            if 'purpose' in keys and filter['purpose'] not in ['', None]:
                params.append(int(filter['purpose']))
                where.append("""
                    purpose_id_cli = %s
                """ % self.getIdx())

            if 'extent' in keys and filter['extent'] not in ['', None]:
                for coord in filter['extent']:
                    params.append(coord)
                where.append("""
                    ST_Intersects(
                        geom_bho,
                        ST_MakeEnvelope(
                            %s, %s, %s, %s, 2056
                        )
                    )
                """ % (
                    self.getIdx(),
                    self.getIdx(),
                    self.getIdx(),
                    self.getIdx()
                ))

            if 'country' in keys and filter['country'] not in ['', None]:
                params.append(filter['country'])
                where.append("""
                    country_bho = %s
                """ % self.getIdx())

            if 'canton' in keys and filter['canton'] not in ['', None]:
                params.append(filter['canton'])
                where.append("""
                    canton_bho = %s
                """ % self.getIdx())

            if 'municipality' in keys and filter['municipality'] not in ['', None]:
                params.append(filter['municipality'])
                where.append("""
                    municipality_bho = %s
                """ % self.getIdx())

            if 'groundwater' in keys and filter['groundwater'] != -1:
                if filter['groundwater'] == None:
                    where.append("""
                        groundwater_bho IS NULL
                    """)
                else:
                    params.append(filter['groundwater'])
                    where.append("""
                        groundwater_bho = %s
                    """ % self.getIdx())

            if 'creation' in keys and filter['creation'] not in ['', None]:
                params.append(filter['creation'])
                where.append("""
                    created_bho::date = to_date(%s, 'YYYY-MM-DD')
                """ % self.getIdx())

            if 'restriction_until_from' in keys and filter['restriction_until_from'] not in ['', None]:
                params.append(filter['restriction_until_from'])
                where.append("""
                    restriction_until_bho >= to_date(%s, 'YYYY-MM-DD')
                """ % self.getIdx())

            if 'restriction_until_to' in keys and filter['restriction_until_to'] not in ['', None]:
                params.append(filter['restriction_until_to'])
                where.append("""
                    restriction_until_bho <= to_date(%s, 'YYYY-MM-DD')
                """ % self.getIdx())

            if 'national_interest' in keys and filter['national_interest'] != -1:
                if filter['national_interest'] == None:
                    where.append("""
                        national_interest IS NULL
                    """)
                else:
                    params.append(filter['national_interest'])
                    where.append("""
                        national_interest = %s
                    """ % self.getIdx())

            if 'location_precision' in keys and filter[
                    'location_precision'] not in ['', None]:
                params.append(int(filter['location_precision']))
                where.append("""
                    qt_location_id_cli = %s
                """ % self.getIdx())

            if 'reference_elevation_from' in keys and filter['reference_elevation_from'] not in ['', None]:
                params.append(float(filter['reference_elevation_from']))
                where.append("""
                    reference_elevation_bho >= %s
                """ % self.getIdx())

            if 'reference_elevation_to' in keys and filter['reference_elevation_to'] not in ['', None]:
                params.append(float(filter['reference_elevation_to']))
                where.append("""
                    reference_elevation_bho <= %s
                """ % self.getIdx())

            if 'reference_elevation_type' in keys and filter[
                    'reference_elevation_type'] not in ['', None]:
                params.append(int(filter['reference_elevation_type']))
                where.append("""
                    reference_elevation_type_id_cli = %s
                """ % self.getIdx())

            if 'qt_reference_elevation' in keys and filter[
                    'qt_reference_elevation'] not in ['', None]:
                params.append(int(filter['qt_reference_elevation']))
                where.append("""
                    qt_reference_elevation_id_cli = %s
                """ % self.getIdx())

            if 'elevation_z_from' in keys and filter['elevation_z_from'] not in ['', None]:
                params.append(float(filter['elevation_z_from']))
                where.append("""
                    elevation_z_bho >= %s
                """ % self.getIdx())

            if 'elevation_z_to' in keys and filter['elevation_z_to'] not in ['', None]:
                params.append(float(filter['elevation_z_to']))
                where.append("""
                    elevation_z_bho <= %s
                """ % self.getIdx())

            if 'elevation_precision' in keys and filter[
                    'elevation_precision'] not in ['', None]:
                params.append(int(filter['elevation_precision']))
                where.append("""
                    qt_elevation_id_cli = %s
                """ % self.getIdx())

            if 'length_from' in keys and filter['length_from'] not in ['', None]:
                params.append(float(filter['length_from']))
                where.append("""
                    total_depth_bho >= %s
                """ % self.getIdx())

            if 'length_to' in keys and filter['length_to'] not in ['', None]:
                params.append(float(filter['length_to']))
                where.append("""
                    total_depth_bho <= %s
                """ % self.getIdx())

            if 'top_bedrock_fresh_md_from' in keys and filter['top_bedrock_fresh_md_from'] not in ['', None]:
                params.append(float(filter['top_bedrock_fresh_md_from']))
                where.append("""
                    top_bedrock_fresh_md >= %s
                """ % self.getIdx())

            if 'top_bedrock_fresh_md_to' in keys and filter['top_bedrock_fresh_md_to'] not in ['', None]:
                params.append(float(filter['top_bedrock_fresh_md_to']))
                where.append("""
                    top_bedrock_fresh_md <= %s
                """ % self.getIdx())

            if 'top_bedrock_weathered_md_from' in keys and filter['top_bedrock_weathered_md_from'] not in ['', None]:
                params.append(float(filter['top_bedrock_weathered_md_from']))
                where.append("""
                    top_bedrock_weathered_md >= %s
                """ % self.getIdx())

            if 'top_bedrock_weathered_md_to' in keys and filter['top_bedrock_weathered_md_to'] not in ['', None]:
                params.append(float(filter['top_bedrock_weathered_md_to']))
                where.append("""
                    top_bedrock_weathered_md <= %s
                """ % self.getIdx())

            if 'lithology_top_bedrock' in keys and filter[
                    'lithology_top_bedrock'] not in ['', None]:
                params.append(int(filter['lithology_top_bedrock']))
                where.append("""
                    lithology_top_bedrock_id_cli = %s
                """ % self.getIdx())

            if 'qt_depth' in keys and filter['qt_depth'] not in ['', None]:
                params.append(int(filter['qt_depth']))
                where.append("""
                    qt_depth_id_cli = %s
                """ % self.getIdx())

            if 'spatial_reference_system' in keys and filter['spatial_reference_system'] not in ['', None]:
                params.append(int(filter['spatial_reference_system']))
                where.append("""
                    srs_id_cli = %s
                """ % self.getIdx())

            if 'lithostratigraphy_top_bedrock' in keys and filter[
                    'lithostratigraphy_top_bedrock'] not in ['', None]:
                params.append(int(filter['lithostratigraphy_top_bedrock']))
                where.append("""
                    lithostrat_id_cli = %s
                """ % self.getIdx())

            if 'chronostratigraphy_top_bedrock' in keys and filter[
                    'chronostratigraphy_top_bedrock'] not in ['', None]:
                params.append(int(filter['chronostratigraphy_top_bedrock']))
                where.append("""
                    lithostrat_id_cli = %s
                """ % self.getIdx())

            if 'created_date_from' in keys and filter['created_date_from'] not in ['', None]:
                params.append(filter['created_date_from'])
                where.append("""
                    created_bho >= to_date(%s, 'YYYY-MM-DD')
                """ % self.getIdx())

            if 'created_date_to' in keys and filter['created_date_to'] not in ['', None]:
                params.append(filter['created_date_to'])
                where.append("""
                    created_bho <= to_date(%s, 'YYYY-MM-DD')
                """ % self.getIdx())

            if 'created_by' in keys and filter['created_by'] not in ['', None]:
                params.append(filter['created_by'])
                where.append("""
                    creator.username ILIKE %s
                """ % self.getIdx())

        return where, params

    def filterChronostratigraphy(self, filter={}):
        params = []
        where = []
        joins = []

        keys = filter.keys()

        if 'chronostratigraphy_id' in keys and filter['chronostratigraphy_id'] not in ['', None]:

            params.append(filter['chronostratigraphy_id'])
            where.append("""
                chronostratigraphy_id = %s
            """ % self.getIdx())

        return where, params, joins

    def filterLithostratigraphy(self, filter={}):
        params = []
        where = []
        joins = []

        keys = filter.keys()

        if 'lithostratigraphy_id' in keys and filter['lithostratigraphy_id'] not in ['', None]:

            params.append(filter['lithostratigraphy_id'])
            where.append("""
                lithostratigraphy_id = %s
            """ % self.getIdx())

        return where, params, joins
