# -*- coding: utf-8 -*-
import asyncio
from bms.v1.action import Action
from bms.v1.exceptions import (
    DuplicateException
)
from bms.v1.borehole.geom.patch import PatchGeom
import json


class DraftTerms(Action):

    async def execute(self, terms):
        """
            Example:

            terms = {
                "en": "foo bar ...",
                "de": "föö bär ...",
                "fr": "fòò bâr ...",
                "it": "fö al bar ..."
            }
        """
        try:
            # Begin transaction
            await self.conn.execute("BEGIN;")

            # Check if all language given and meanwhile prepare sql inputs
            values = []
            for lang in ["en", "de", "fr", "it", "ro"]:
                if lang not in terms.keys():
                    raise Exception(f"Missing \"{lang}\" language.")

                values.append(terms[lang])

            # Get draft if present
            id_tes = await self.conn.fetchval("""
                SELECT
                    id_tes
                FROM
                    bdms.terms
                WHERE
                    draft_tes IS TRUE
            """)

            if id_tes is None:
                # Create a new draft (draft_tes default value is true)
                await self.conn.execute("""
                    INSERT INTO bdms.terms (
                        text_tes_en,
                        text_tes_de,
                        text_tes_fr,
                        text_tes_it,
                        text_tes_ro
                    ) VALUES (
                        $1, $2, $3, $4, $5
                    )
                    RETURNING id_tes
                """, *values)

            else:
                # Update the active draft
                values += [id_tes]

                await self.conn.execute("""
                    UPDATE
                        bdms.terms

                    SET
                        text_tes_en=$1,
                        text_tes_de=$2,
                        text_tes_fr=$3,
                        text_tes_it=$4,
                        text_tes_ro=$5

                    WHERE
                        id_tes = $6
                """, *values)

                # Commit changes to db
            await self.conn.execute("COMMIT;")

            return None

        except Exception:
            await self.conn.execute("ROLLBACK;")
            raise Exception("Error while accepting terms")
