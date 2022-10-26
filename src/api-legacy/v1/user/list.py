# -*- coding: utf-8 -*-
from bms.v1.action import Action
import math


class ListUsers(Action):

    async def execute(self):

        val = await self.conn.fetchval(
            """
                SELECT
                    array_to_json(
                        array_agg(
                            row_to_json(t)
                        )
                    )
                FROM (
                    SELECT
                        id_usr as id,
                        admin_usr as admin,
                        viewer_usr as viewer,
                        username,
                        COALESCE(
                            firstname, ''
                        ) AS firstname,
                        COALESCE(
                            middlename, ''
                        ) AS middlename,
                        COALESCE(
                            lastname, ''
                        ) AS lastname,
                        COALESCE(
                            workgroups, '{}'::json[]
                        ) AS workgroups,
                        to_char(
                            disabled_usr,
                            'YYYY-MM-DD"T"HH24:MI:SSOF'
                        ) as disabled,
                        to_char(
                            created_usr,
                            'YYYY-MM-DD"T"HH24:MI:SSOF'
                        ) as created,
                        contributions

	                FROM
                        bdms.users

                    LEFT JOIN (
                        SELECT
                            id_usr_fk,
                            array_agg(
                                json_build_object(
                                    'id', id_wgp_fk,
                                    'roles', roles
                                )
                            ) as workgroups
                        FROM (
                            SELECT
                                id_usr_fk,
                                id_wgp_fk,
                                array_agg(name_rol) as roles
                            FROM
                                bdms.users_roles
                            INNER JOIN
                                bdms.roles
                            ON
                                id_rol = id_rol_fk

                            GROUP BY
                                id_usr_fk, id_wgp_fk
                        )
                        AS wg
                        GROUP BY
                            id_usr_fk
                    ) as w
                    ON
                        w.id_usr_fk = id_usr

                    INNER JOIN (
                        SELECT
                            id_usr as id_usr_sta,
                            (
                                COALESCE(workflows, 0)
                                + COALESCE(layers, 0)
                                + COALESCE(borehole_author, 0)
                                + COALESCE(borehole_updater, 0)
                                + COALESCE(borehole_locker, 0)
                                + COALESCE(stratigraphy_author, 0)
                                + COALESCE(stratigraphy_updater, 0)
                                + COALESCE(files, 0)
                                + COALESCE(borehole_files, 0)
                            ) as contributions

                        FROM
                            bdms.users

                        LEFT JOIN (
                            SELECT
                                id_usr_fk,
                                count(id_usr_fk) as workflows
                            FROM
                                bdms.workflow
                            GROUP BY
                                id_usr_fk
                        ) as wf
                        ON id_usr = wf.id_usr_fk

                        LEFT JOIN (
                            SELECT
                                creator_lay,
                                count(creator_lay) as layers
                            FROM
                                bdms.layer
                            GROUP BY
                                creator_lay
                        ) as ly
                        ON id_usr = ly.creator_lay

                        LEFT JOIN (
                            SELECT
                                created_by_bho,
                                count(created_by_bho) as borehole_author
                            FROM
                                bdms.borehole
                            GROUP BY
                                created_by_bho
                        ) as bha
                        ON id_usr = bha.created_by_bho

                        LEFT JOIN (
                            SELECT
                                updated_by_bho,
                                count(updated_by_bho) as borehole_updater
                            FROM
                                bdms.borehole
                            GROUP BY
                                updated_by_bho
                        ) as bhu
                        ON id_usr = bhu.updated_by_bho

                        LEFT JOIN (
                            SELECT
                                locked_by_bho,
                                count(locked_by_bho) as borehole_locker
                            FROM
                                bdms.borehole
                            GROUP BY
                                locked_by_bho
                        ) as bhl
                        ON id_usr = bhl.locked_by_bho

                        LEFT JOIN (
                            SELECT
                                author_sty,
                                count(author_sty) as stratigraphy_author
                            FROM
                                bdms.stratigraphy
                            GROUP BY
                                author_sty
                        ) as stc
                        ON id_usr = stc.author_sty

                        LEFT JOIN (
                            SELECT
                                updater_sty,
                                count(updater_sty) as stratigraphy_updater
                            FROM
                                bdms.stratigraphy
                            GROUP BY
                                updater_sty
                        ) as stu
                        ON id_usr = stu.updater_sty

                        LEFT JOIN (
                            SELECT
                                id_usr_fk,
                                count(id_usr_fk) as files
                            FROM
                                bdms.files
                            GROUP BY
                                id_usr_fk
                        ) as f
                        ON id_usr = f.id_usr_fk

                        LEFT JOIN (
                            SELECT
                                id_usr_fk,
                                count(id_usr_fk) as borehole_files
                            FROM
                                bdms.borehole_files
                            GROUP BY
                                id_usr_fk
                        ) as bf
                        ON id_usr = bf.id_usr_fk

                    ) AS stats
                    ON stats.id_usr_sta = id_usr

                    /*WHERE
                        admin_usr IS FALSE*/

                    ORDER BY
                        username
                ) as t
            """
        )

        return {
            "data": self.decode(val) if val is not None else []
        }
