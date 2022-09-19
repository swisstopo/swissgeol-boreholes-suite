# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.borehole.geom.patch import PatchGeom
import json


class GetTerms(Action):

    async def execute(self):
        # Default language
        dl = 'en'
        
        try:
            # Check if already accepted
            val = await self.conn.fetchval(f"""
                SELECT
                    row_to_json(t)

                FROM (    
                    SELECT
                        id_tes AS id,
                        draft_tes AS draft,
                        text_tes_en AS en,
                        COALESCE(
                            text_tes_de,
                            text_tes_{dl}
                        ) AS de,
                        COALESCE(
                            text_tes_fr,
                            text_tes_{dl}
                        ) AS fr,
                        COALESCE(
                            text_tes_it,
                            text_tes_{dl}
                        ) AS it,
                        COALESCE(
                            text_tes_ro,
                            text_tes_{dl}
                        ) AS ro

                    FROM
                        bdms.terms

                    WHERE
                        expired_tes IS NULL

                    AND
                        draft_tes IS FALSE

                ) t
            """)

            return {
                "data": self.decode(val) if val is not None else None
            }

        except Exception:
            raise Exception("Error while getting current terms")


class GetTermsDraft(Action):

    async def execute(self):
        # Default language
        dl = 'en'

        # Check if draft exists
        exists = await self.conn.fetchval("""
            SELECT EXISTS(
                SELECT 1
                FROM
                    bdms.terms
                WHERE
                    draft_tes IS TRUE
            ) AS exists
        """)
        
        sql_draft_filter = '''
            AND
                draft_tes IS FALSE
        '''

        if exists is True:
            sql_draft_filter = '''
                AND
                    draft_tes IS TRUE
            '''

        try:
            # Check if already accepted
            val = await self.conn.fetchval(f"""
                SELECT
                    row_to_json(t)

                FROM (    
                    SELECT
                        id_tes AS id,
                        draft_tes AS draft,
                        text_tes_en AS en,
                        COALESCE(
                            text_tes_de,
                            text_tes_{dl}
                        ) AS de,
                        COALESCE(
                            text_tes_fr,
                            text_tes_{dl}
                        ) AS fr,
                        COALESCE(
                            text_tes_it,
                            text_tes_{dl}
                        ) AS it,
                        COALESCE(
                            text_tes_ro,
                            text_tes_{dl}
                        ) AS ro

                    FROM
                        bdms.terms

                    WHERE
                        expired_tes IS NULL

                    {sql_draft_filter}

                ) t
            """)

            return {
                "data": self.decode(val) if val is not None else None
            }

        except Exception:
            raise Exception("Error while getting current terms")
