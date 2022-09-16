# -*- coding: utf-8 -*-
import asyncio
from bms.v1.action import Action
from bms.v1.exceptions import (
    DuplicateException
)
from bms.v1.borehole.geom.patch import PatchGeom
import json


class DraftContent(Action):

    async def execute(self, name, content):
        """
            Example:

            name,
            {
                "title": {
                    "en": "foo bar ...",
                    "de": "föö bär ...",
                    "fr": "fòò bâr ...",
                    "it": "fö al bar ..."
                },
                "body": {
                    "en": "foo bar ...",
                    "de": "föö bär ...",
                    "fr": "fòò bâr ...",
                    "it": "fö al bar ..."
                }
            }
        """
        try:
            # Check if all language given and meanwhile prepare sql inputs
            title = []
            body = []

            if 'body' not in content.keys():
                raise Exception(f"Missing \"body\" key in content.")

            if 'title' not in content.keys():
                raise Exception(f"Missing \"title\" key in content.")

            for lang in ["en", "de", "fr", "it", "ro"]:
                if lang not in content['title'].keys():
                    raise Exception(f"Missing \"{lang}\" language in title.")
                if lang not in content['body'].keys():
                    raise Exception(f"Missing \"{lang}\" language in body.")

                title.append(content['title'][lang])
                body.append(content['body'][lang])

            # Begin transaction
            await self.conn.execute("BEGIN;")

            # Get draft if present
            id_cnt = await self.conn.fetchval("""
                SELECT
                    id_cnt
                FROM
                    bdms.contents
                WHERE
                    draft_cnt IS TRUE
                AND
                    name_cnt = $1
            """, name)

            if id_cnt is None:
                # Create a new draft (draft_cnt default value is true)
                await self.conn.execute("""
                    INSERT INTO bdms.contents (
                        name_cnt,

                        -- Title
                        title_cnt_en,
                        title_cnt_de,
                        title_cnt_fr,
                        title_cnt_it,
                        title_cnt_ro,

                        -- Body
                        text_cnt_en,
                        text_cnt_de,
                        text_cnt_fr,
                        text_cnt_it,
                        text_cnt_ro

                    ) VALUES (
                        $1,
                        $2, $3, $4, $5,  $6,
                        $7, $8, $9, $10, $11
                    )
                    RETURNING
                        id_cnt
                """, name, *title, *body)

            else:
                # Update the active draft
                await self.conn.execute("""
                    UPDATE
                        bdms.contents

                    SET
                        -- Title
                        title_cnt_en=$1,
                        title_cnt_de=$2,
                        title_cnt_fr=$3,
                        title_cnt_it=$4,
                        title_cnt_ro=$5,

                        -- Body
                        text_cnt_en=$6,
                        text_cnt_de=$7,
                        text_cnt_fr=$8,
                        text_cnt_it=$9,
                        text_cnt_ro=$10

                    WHERE
                        id_cnt = $11
                """, *title, *body, id_cnt)

                # Commit changes to db
            await self.conn.execute("COMMIT;")

            return None

        except Exception:
            await self.conn.execute("ROLLBACK;")
            raise Exception("Error while saving draft")
