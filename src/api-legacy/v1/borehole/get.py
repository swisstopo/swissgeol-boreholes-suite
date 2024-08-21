# -*- coding: utf-8 -*-
from bms.v1.action import Action


class GetBorehole(Action):

    @staticmethod
    def get_sql(sql_lock='', file_permission=''):

        return f"""
            SELECT
                borehole.id_bho as id,
                'False' as imported,
                borehole.public_bho as visible,
                (
                    SELECT row_to_json(t)
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
                ) as updater,
                (
                    select row_to_json(t2)
                    FROM (
                        SELECT
                            creator.id_usr as id,
                            creator.username as username,
                            updater.firstname || ' ' || updater.lastname
                                as fullname,
                            to_char(
                                created_bho,
                                'YYYY-MM-DD"T"HH24:MI:SSOF'
                            ) as date
                    ) t2
                ) as creator,
                {sql_lock}
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
                qt_location_id_cli as location_precision,
                elevation_z_bho as elevation_z,
                hrs_id_cli as height_reference_system,
                qt_elevation_id_cli as elevation_precision,

                reference_elevation_bho as reference_elevation,
                qt_reference_elevation_id_cli as qt_reference_elevation,
                reference_elevation_type_id_cli as reference_elevation_type,

                total_depth_bho as total_depth,
                (
                    SELECT row_to_json(t)
                    FROM (
                        SELECT
                            COALESCE(
                                original_name_bho, ''
                            ) as original_name,
                            purpose_id_cli as purpose,
                            status_id_cli as status,
                            top_bedrock_fresh_md as top_bedrock_fresh_md,
                            groundwater_bho as groundwater
                    ) t
                ) as extended,
                (
                    SELECT row_to_json(t)
                    FROM (
                        SELECT
                            identifiers,
                            COALESCE(
                                project_name_bho, ''
                            ) as project_name,
                            COALESCE(
                                alternate_name_bho, ''
                            ) as alternate_name,
                            country_bho as country,
                            canton_bho as canton,
                            municipality_bho as municipality,
                            qt_depth_id_cli as qt_depth,
                            top_bedrock_weathered_md,
                            lithology_top_bedrock_id_cli as lithology_top_bedrock,
                            lithostrat_id_cli as lithostratigraphy_top_bedrock,
                            chronostrat_id_cli AS chronostratigraphy_top_bedrock,
                            COALESCE(
                                remarks_bho, ''
                            ) as remarks
                    ) t
                ) as custom,
                stratigraphy as stratigraphy,
                (
                    SELECT row_to_json(t)
                    FROM (
                        SELECT
                            id_wgp as id,
                            name_wgp as name
                    ) t
                ) as workgroup,
                pubblications,
                status[array_length(status, 1)] as workflow,
                status[array_length(status, 1)]  ->> 'role' as "role",
                COALESCE(atc.attachments, 0) as attachments
            FROM
                bdms.borehole

            INNER JOIN bdms.workgroups
            ON id_wgp = id_wgp_fk

            LEFT JOIN (
                SELECT
                    borehole_id,
                    array_to_json(array_agg(j)) as identifiers
                FROM (
                    SELECT
                        borehole_id,
                        json_build_object(
                            'id', identifier_id,
                            'value', identifier_value
                        ) as j
                    FROM
                        bdms.borehole_identifiers_codelist
                ) t
                GROUP BY
                    borehole_id
            ) as idf
            ON
                idf.borehole_id = id_bho

            LEFT JOIN (
                SELECT
                    id_bho_fk,
                    count(id_fil) as attachments
                FROM
                    bdms.files
                INNER JOIN
                    bdms.borehole_files
                ON
                    id_fil_fk = id_fil

                {file_permission}

                GROUP BY
                    id_bho_fk
            ) AS atc
            ON
                atc.id_bho_fk = id_bho

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

            LEFT JOIN (
                SELECT
                    id_bho_fk,
                    array_agg(
                        json_build_object(
                            'workflow', id_wkf,
                            'username', username,
                            'finished', finished
                        )
                    ) as pubblications
                FROM (
                    SELECT
                        id_bho_fk,
                        id_wkf,
                        username,
                        finished_wkf as finished
                    FROM
                        bdms.workflow,
                        bdms.roles,
                        bdms.users
                    WHERE
                        id_rol = 4
                    AND
                        id_rol = id_rol_fk
                    AND
                        id_usr = id_usr_fk
                    ORDER BY
                        finished_wkf desc
                ) t
                GROUP BY
                    id_bho_fk
            ) as p
            ON
                p.id_bho_fk = id_bho

            INNER JOIN bdms.users as updater
                ON updated_by_bho = updater.id_usr

            INNER JOIN bdms.users as creator
                ON created_by_bho = creator.id_usr

            LEFT JOIN bdms.users as locker
                ON locked_by_bho = locker.id_usr

            LEFT JOIN (
                SELECT
                    id_bho_fk,
                    array_to_json(
                        array_agg(
                            json_build_object(
                                'id', id,
                                'name', "name",
                                'primary', "primary",
                                'layers', layers,
                                'date', date
                            )
                        )
                    ) AS stratigraphy
                FROM (
                    SELECT
                        id_bho_fk,
                        id_sty AS id,
                        name_sty AS "name",
                        primary_sty as "primary",
                        to_char(
                            date_sty, 'YYYY-MM-DD'
                        ) AS date,
                        COUNT(id_lay) AS layers

                    FROM
                        bdms.stratigraphy

                    LEFT JOIN bdms.layer
                        ON layer.id_sty_fk = id_sty

                    GROUP BY id_bho_fk, id_sty, date_sty

                    ORDER BY date_sty DESC, id_sty DESC
                ) t
                GROUP BY id_bho_fk
            ) AS strt
                ON strt.id_bho_fk = borehole.id_bho

        """

    async def execute(self, id, with_lock = True, user=None):

        permission = ''
        file_permission = ''


        if user is not None:
            permission = """
                AND {}
            """.format(
                self.filterPermission(user)
            )

        if (
            user['workgroups'] is None or
            len(user['workgroups']) == 0
        ):
            file_permission = ' WHERE public_bfi IS TRUE '

        else:
            where = []
            for workgroup in user['workgroups']:
                where.append(f"""
                    id_wgp_fk = {workgroup['id']}
                """)

            exists = await self.conn.fetchval(
                """
                    SELECT EXISTS(
                        SELECT 1
                        FROM bdms.borehole
                        WHERE
                            id_bho = $1
                        AND
                            ({})
                    ) AS exists
                """.format(
                    ' OR '.join(where)
                ), id
            )

            if exists is False:
                file_permission = ' WHERE public_bfi IS TRUE '

        sql_lock = ""
        if with_lock:
            sql_lock = f"""
                CASE
                    WHEN (
                        borehole.locked_by_bho is NULL
                        OR (
                            borehole.locked_bho < NOW()
                                - INTERVAL '{self.lock_timeout} minutes'
                        )
                    ) THEN NULL
                    ELSE (
                        select row_to_json(t2)
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
                        ) t2
                    )
                END AS lock,
            """

        val = await self.conn.fetchval(f"""
            SELECT
                row_to_json(t)
            FROM (
                {GetBorehole.get_sql(sql_lock, file_permission)}

                WHERE borehole.id_bho = $1
                {permission}
            ) AS t
        """, id)

        return {
            "data": self.decode(val) if val is not None else None
        }
