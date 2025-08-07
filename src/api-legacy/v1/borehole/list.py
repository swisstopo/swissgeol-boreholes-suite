# -*- coding: utf-8 -*-
from bms.v1.action import Action
import math


class ListBorehole(Action):

    def __init__(self, conn=None, geolcode=False):
        super(ListBorehole, self).__init__(conn=conn)
        self.geolcode = geolcode

    @staticmethod
    def get_sql_geolcode(cols=None, join=None, where=None):
        return f"""
            SELECT
                id_bho as id,

                public_bho as published,
                to_char(
                    updated_bho,
                    'YYYY-MM-DD'
                ) as updated,
                to_char(
                    created_bho,
                    'YYYY-MM-DD'
                ) as created,

                original_name_bho as original_name,
                project_name_bho as project_name,
                alternate_name_bho as alternate_name,
                knd.geolcode as borehole_type,

                rest.geolcode as restriction,
                to_char(
                    restriction_until_bho,
                    'YYYY-MM-DD'
                ) as restriction_until,
                national_interest,

                location_x_bho as location_x,
                location_y_bho as location_y,
                location_x_lv03_bho as location_x_lv03,
                location_y_lv03_bho as location_y_lv03,
                precision_location_x,
                precision_location_y,
                precision_location_x_lv03,
                precision_location_y_lv03,
                srd.geolcode as spatial_reference_system,

                qtloc.geolcode as location_precision,
                elevation_z_bho as elevation_z,
                height_reference_system.geolcode as height_reference_system,
                qth.geolcode as elevation_precision,

                reference_elevation_bho as reference_elevation,
                qre.geolcode as qt_reference_elevation,
                ret.geolcode as reference_elevation_type,

                meth.geolcode as method,
                cut.geolcode as cuttings,
                prp.geolcode as purpose,
                sts.geolcode as status,

                total_depth_bho as total_depth,
                qt_len.geolcode as qt_depth,

                top_bedrock_fresh_md as top_bedrock_fresh_md,
                qt_tbed.geolcode as top_bedrock_weathered_md,

                groundwater_bho as groundwater,

                ids.identifiers,
				ids.identifiers_value,
				remarks_bho as remarks,
                lithology_top_bedrock_id_cli as lithology_top_bedrock,
                lithostrat_id_cli as lithostratigraphy_top_bedrock,
                chronostrat_id_cli AS chronostratigraphy_top_bedrock

                {f'{cols}' if cols else ''}

            FROM
                bdms.borehole

            LEFT JOIN (
                SELECT
                    borehole_id,
                    array_agg(identifier_id) as identifiers,
                    array_agg(identifier_value) as identifiers_value
                FROM
                    bdms.borehole_identifiers_codelist
                GROUP BY borehole_id
            ) as ids
            ON
                ids.borehole_id = id_bho

            LEFT JOIN (
                SELECT
                    borehole_id,
                    array_to_json(array_agg(j)) as identifiers
                FROM (
                    SELECT
                        borehole_id,
                        json_build_object(
                            'borehole_identifier', identifier_id,
                            'identifier_value', identifier_value
                        ) as j
                    FROM
                        bdms.borehole_identifiers_codelist
                ) t
                GROUP BY
                    borehole_id
            ) as idf
            ON
                idf.borehole_id = id_bho

            LEFT JOIN bdms.codelist as rest
                ON rest.id_cli = restriction_id_cli

            LEFT JOIN bdms.codelist as knd
                ON knd.id_cli = borehole_type_id

            LEFT JOIN bdms.codelist as srd
                ON srd.id_cli = srs_id_cli

            LEFT JOIN bdms.codelist as qtloc
                ON qtloc.id_cli = qt_location_id_cli

            LEFT JOIN bdms.codelist as height_reference_system
                ON height_reference_system.id_cli = hrs_id_cli

            LEFT JOIN bdms.codelist as qth
                ON qth.id_cli = qt_elevation_id_cli

            LEFT JOIN bdms.codelist as qre
                ON qre.id_cli = qt_reference_elevation_id_cli

            LEFT JOIN bdms.codelist as ret
                ON ret.id_cli = reference_elevation_type_id_cli

            LEFT JOIN bdms.codelist as qt_len
                ON qt_len.id_cli = qt_depth_id_cli

            LEFT JOIN bdms.codelist as prp
                ON prp.id_cli = purpose_id_cli

            LEFT JOIN bdms.codelist as sts
                ON sts.id_cli = status_id_cli

            {f'{join}' if join else ''}

            {f'{where}' if where else ''}
        """

    @staticmethod
    def get_sql():
        return """
            SELECT
                id_bho as id,
                (
                    select row_to_json(t)
                    FROM (
                        SELECT
                            creator.id_usr as id,
                            creator.username as username,
                            to_char(
                                created_bho,
                                'YYYY-MM-DD"T"HH24:MI:SSOF'
                            ) as date
                    ) t
                ) as creator,
                original_name_bho as original_name,
                borehole_type_id as borehole_type,
                restriction_id_cli as restriction,
                to_char(
                    restriction_until_bho,
                    'YYYY-MM-DD'
                ) as restriction_until,
                national_interest,
                location_x_bho as location_x,
                location_y_bho as location_y,
                location_x_lv03_bho as location_x_lv03,
                location_y_lv03_bho as location_y_lv03,
                precision_location_x,
                precision_location_y,
                precision_location_x_lv03,
                precision_location_y_lv03,
                srs_id_cli as spatial_reference_system,
                elevation_z_bho as elevation_z,
                hrs_id_cli as height_reference_system,
                total_depth_bho as total_depth,
                (
                    select row_to_json(t)
                    FROM (
                        SELECT
                            status_id_cli as status,
                            purpose_id_cli as purpose,
                            top_bedrock_fresh_md as top_bedrock_fresh_md
                    ) t
                ) as extended,
                (
                    select row_to_json(t)
                    FROM (
                        SELECT
                            identifiers
                    ) t
                ) as custom


            FROM
                bdms.borehole

            INNER JOIN
                bdms.users as creator
            ON
                created_by_bho = creator.id_usr

            LEFT JOIN (
                SELECT
                    borehole_id,
                    array_agg(identifier_id) as borehole_identifier,
                    array_agg(identifier_value) as identifier_value
                FROM
                    bdms.borehole_identifiers_codelist
                GROUP BY borehole_id
            ) as ids
            ON
                ids.borehole_id = id_bho

            LEFT JOIN (
                SELECT
                    borehole_id,
                    array_to_json(array_agg(j)) as identifiers
                FROM (
                    SELECT
                        borehole_id,
                        json_build_object(
                            'borehole_identifier', identifier_id,
                            'identifier_value', identifier_value
                        ) as j
                    FROM
                        bdms.borehole_identifiers_codelist
                ) t
                GROUP BY
                    borehole_id
            ) as idf
            ON
                idf.borehole_id = id_bho
        """

    async def execute(
        self, limit=None, page=None,
        filter={}, orderby=None, direction=None, user=None
    ):

        permissions = None
        if user is not None:
            permissions = self.filterPermission(user)

        paging = ''

        layer_where, layer_params, layer_joins = self.filterProfileLayers(
            filter)

        where, params = self.filterBorehole(filter)

        if limit is not None and page is not None:
            paging = """
                LIMIT %s
                OFFSET %s
            """ % (self.getIdx(), self.getIdx())
            params += [
                limit, (int(limit) * (int(page) - 1))
            ]

        rowsSql = (
            self.get_sql_geolcode()
            if self.geolcode
            else self.get_sql()
        )

        cntSql = """
         SELECT
             count(*) AS cnt
         FROM
             bdms.borehole

         LEFT JOIN (
             SELECT
                 borehole_id,
                 array_agg(identifier_id) as borehole_identifier,
                 array_agg(identifier_value) as identifier_value
             FROM
                 bdms.borehole_identifiers_codelist
             GROUP BY borehole_id
         ) as ids
         ON
             ids.borehole_id = id_bho
        """

        if len(layer_params) > 0:
            joins_string = "\n".join(layer_joins) if len(
                layer_joins) > 0 else ''
            where_string = (
                "AND {}".format(" AND ".join(layer_where))
                if len(layer_where) > 0
                else ''
            )

            strt_sql = """
                INNER JOIN (
                    SELECT DISTINCT
                        id_bho_fk,
                        name_sty

                    FROM
                        bdms.stratigraphy

                    INNER JOIN
                        bdms.layer
                    ON
                        id_sty_fk = id_sty

                    {}

                    {}

                ) as strt2
                ON
                    borehole.id_bho = strt2.id_bho_fk
            """.format(
                joins_string, where_string
            )
            rowsSql += strt_sql
            cntSql += strt_sql

        if len(where) > 0:
            rowsSql += """
                WHERE {}
            """.format(
                " AND ".join(where)
            )
            cntSql += """
                WHERE {}
            """.format(
                " AND ".join(where)
            )

        if permissions is not None:
            operator = 'AND' if len(where) > 0 else 'WHERE'
            rowsSql += """
                {} {}
            """.format(
                operator, permissions
            )
            cntSql += """
                {} {}
            """.format(
                operator, permissions
            )

        _orderby, direction = self.getordering(orderby, direction)

        sql = """
            SELECT
                array_to_json(
                    array_agg(
                        row_to_json(t)
                    )
                ),
                COALESCE((
                    %s
                ), 0)
            FROM (
                %s
            ORDER BY %s %s NULLS LAST %s
            ) AS t
        """ % (
            cntSql,
            rowsSql,
            _orderby,
            direction,
            paging
        )

        rec = await self.conn.fetchrow(
            sql, *(layer_params + params)
        )

        return {
            "data": self.decode(rec[0]) if rec[0] is not None else [],
            "orderby": orderby,
            "direction": direction,
            "page": page if page is not None else 1,
            "pages": math.ceil(rec[1]/limit) if limit is not None else 1,
            "rows": rec[1]
        }
