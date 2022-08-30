# -*- coding: utf-8 -*-
from bms.v1.action import Action


class DeleteUser(Action):

    async def execute(self, id):

        # Check if user has done contributions
        contributions = await self.conn.fetchval("""
            SELECT
                (
                    COALESCE(workflows, 0)
                    + COALESCE(layers, 0)
                    + COALESCE(borehole_author, 0)
                    + COALESCE(borehole_updater, 0)
                    + COALESCE(borehole_locker, 0)
                    + COALESCE(stratigraphy_author, 0)
                    + COALESCE(stratigraphy_updater, 0)
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

            WHERE id_usr = $1
        """, id)

        if contributions > 0:
            raise Exception(
                f"User cannot be deleted because of {contributions} contributions"
            )

        await self.conn.execute("""
            DELETE FROM bdms.users
            WHERE id_usr = $1
        """, id)

        return None
