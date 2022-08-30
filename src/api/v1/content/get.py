# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.borehole.geom.patch import PatchGeom
import json


class GetContent(Action):

    async def execute(self, name):
        # Default language
        dl = 'en'
        
        try:
            # Check if already accepted
            val = await self.conn.fetchval(f"""
                SELECT
                    row_to_json(t)

                FROM (    
                    SELECT
                        id_cnt AS id,
                        draft_cnt AS draft,
                        (
                            SELECT row_to_json(t)
                            FROM (
                                SELECT
                                    title_cnt_en AS en,
                                    COALESCE(
                                        title_cnt_de,
                                        title_cnt_{dl}
                                    ) AS de,
                                    COALESCE(
                                        title_cnt_fr,
                                        title_cnt_{dl}
                                    ) AS fr,
                                    COALESCE(
                                        title_cnt_it,
                                        title_cnt_{dl}
                                    ) AS it,
                                    COALESCE(
                                        title_cnt_ro,
                                        title_cnt_{dl}
                                    ) AS ro
                            ) t
                        ) as title,
                        (
                            SELECT row_to_json(t)
                            FROM (
                                SELECT
                                    text_cnt_en AS en,
                                    COALESCE(
                                        text_cnt_de,
                                        text_cnt_{dl}
                                    ) AS de,
                                    COALESCE(
                                        text_cnt_fr,
                                        text_cnt_{dl}
                                    ) AS fr,
                                    COALESCE(
                                        text_cnt_it,
                                        text_cnt_{dl}
                                    ) AS it,
                                    COALESCE(
                                        text_cnt_ro,
                                        text_cnt_{dl}
                                    ) AS ro
                            ) t
                        ) as body

                    FROM
                        bdms.contents

                    WHERE
                        expired_cnt IS NULL

                    AND
                        draft_cnt IS FALSE

                    AND
                        name_cnt = $1

                ) t
            """, name)

            return {
                "data": self.decode(val) if val is not None else None
            }

        except Exception:
            raise Exception("Error while getting current terms")


class GetContentDraft(Action):

    async def execute(self, name):
        # Default language
        dl = 'en'

        # Check if draft exists
        exists = await self.conn.fetchval("""
            SELECT EXISTS(
                SELECT 1
                FROM
                    bdms.contents
                WHERE
                    draft_cnt IS TRUE
            ) AS exists
        """)
        
        sql_draft_filter = '''
            AND
                draft_cnt IS FALSE
        '''

        if exists is True:
            sql_draft_filter = '''
                AND
                    draft_cnt IS TRUE
            '''

        try:
            # Check if already accepted
            val = await self.conn.fetchval(f"""
                SELECT
                    row_to_json(t)

                FROM (    
                    SELECT
                        id_cnt AS id,
                        draft_cnt AS draft,
                        (
                            SELECT row_to_json(t)
                            FROM (
                                SELECT
                                    title_cnt_en AS en,
                                    COALESCE(
                                        title_cnt_de,
                                        title_cnt_{dl}
                                    ) AS de,
                                    COALESCE(
                                        title_cnt_fr,
                                        title_cnt_{dl}
                                    ) AS fr,
                                    COALESCE(
                                        title_cnt_it,
                                        title_cnt_{dl}
                                    ) AS it,
                                    COALESCE(
                                        title_cnt_ro,
                                        title_cnt_{dl}
                                    ) AS ro
                            ) t
                        ) as title,
                        (
                            SELECT row_to_json(t)
                            FROM (
                                SELECT
                                    text_cnt_en AS en,
                                    COALESCE(
                                        text_cnt_de,
                                        text_cnt_{dl}
                                    ) AS de,
                                    COALESCE(
                                        text_cnt_fr,
                                        text_cnt_{dl}
                                    ) AS fr,
                                    COALESCE(
                                        text_cnt_it,
                                        text_cnt_{dl}
                                    ) AS it,
                                    COALESCE(
                                        text_cnt_ro,
                                        text_cnt_{dl}
                                    ) AS ro
                            ) t
                        ) as body

                    FROM
                        bdms.contents

                    WHERE
                        expired_cnt IS NULL

                    AND
                        name_cnt = $1

                    {sql_draft_filter}

                ) t
            """, name)

            return {
                "data": self.decode(val) if val is not None else None
            }

        except Exception:
            raise Exception("Error while getting current terms")
