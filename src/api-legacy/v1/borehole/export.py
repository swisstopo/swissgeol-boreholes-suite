# -*- coding: utf-8 -*-
from bms.v1.action import Action
import math


class ExportBorehole(Action):

    async def execute(self, filter={}):

        where, params = self.filterBorehole(filter)

        sql = """
            SELECT
                id_bho as id,
                original_name_bho as original_name,
                knd.code_cli as kind,
                location_x_bho as location_x,
                location_y_bho as location_y,
                srd.code_cli as srs,
                elevation_z_bho as elevation_z,
                hrs.code_cli  as hrs,
                to_char(
                    drilling_date_bho,
                    'YYYY-MM-DD'
                ) as drilling_date,
                to_char(
                    spud_date_bho,
                    'YYYY-MM-DD'
                ) as spud_date,
                total_depth_bho as total_depth,
                rest.code_cli as restriction,
                to_char(
                    restriction_until_bho,
                    'YYYY-MM-DD'
                ) as restriction_until,
                meth.code_cli as drilling_method,
                prp.code_cli as purpose,
                sts.code_cli as status,
                top_bedrock_bho as top_bedrock,
                top_bedrock_tvd_bho as top_bedrock_tvd,
                qt_top_bedrock_tvd_id_cli as qt_top_bedrock_tvd,
                groundwater_bho as groundwater
            FROM
                bdms.borehole
            LEFT JOIN bdms.codelist as knd
                ON knd.id_cli = kind_id_cli
            LEFT JOIN bdms.codelist as srd
                ON srd.id_cli = srs_id_cli
            LEFT JOIN bdms.codelist as hrs
                ON hrs.id_cli = hrs_id_cli
            LEFT JOIN bdms.codelist as rest
                ON rest.id_cli = restriction_id_cli
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
        """ % sql, *(params)
        )
        return {
            "data": self.decode(rec) if rec is not None else []
        }
