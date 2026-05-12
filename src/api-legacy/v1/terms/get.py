# -*- coding: utf-8 -*-
from bms.v1.action import Action
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
                        id,
                        draft AS draft,
                        text_en AS en,
                        COALESCE(
                            text_de,
                            text_{dl}
                        ) AS de,
                        COALESCE(
                            text_fr,
                            text_{dl}
                        ) AS fr,
                        COALESCE(
                            text_it,
                            text_{dl}
                        ) AS it,
                        COALESCE(
                            text_ro,
                            text_{dl}
                        ) AS ro

                    FROM
                        bdms.terms

                    WHERE
                        expired IS NULL

                    AND
                        draft IS FALSE

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
                    draft IS TRUE
            ) AS exists
        """)

        sql_draft_filter = '''
            AND
                draft IS FALSE
        '''

        if exists is True:
            sql_draft_filter = '''
                AND
                    draft IS TRUE
            '''

        try:
            # Check if already accepted
            val = await self.conn.fetchval(f"""
                SELECT
                    row_to_json(t)

                FROM (
                    SELECT
                        id,
                        draft AS draft,
                        text_en AS en,
                        COALESCE(
                            text_de,
                            text_{dl}
                        ) AS de,
                        COALESCE(
                            text_fr,
                            text_{dl}
                        ) AS fr,
                        COALESCE(
                            text_it,
                            text_{dl}
                        ) AS it,
                        COALESCE(
                            text_ro,
                            text_{dl}
                        ) AS ro

                    FROM
                        bdms.terms

                    WHERE
                        expired IS NULL

                    {sql_draft_filter}

                ) t
            """)

            return {
                "data": self.decode(val) if val is not None else None
            }

        except Exception:
            raise Exception("Error while getting current terms")
