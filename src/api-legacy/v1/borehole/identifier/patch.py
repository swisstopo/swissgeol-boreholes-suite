# -*- coding: utf-8 -*-
from bms import EDIT
from bms.v1.action import Action
from bms.v1.exceptions import (
    NotFound,
    MissingParameter,
    WrongParameter
)


class PatchIdentifier(Action):

    async def execute(self, id, text):

        # Check if identifier exists
        check = await self.conn.fetchval("""
            SELECT
                schema_cli
            FROM
                bdms.codelist
            WHERE
                id_cli = $1
        """,
            id
        )

        if check != 'borehole_identifier':
            raise NotFound()

        # validate text dict
        languages = list(text.keys())
        allowed_languages = [
            'en', 'de',
            'fr', 'it'
        ]

        for lang in allowed_languages:
            if lang not in languages:
                raise MissingParameter(lang)

            languages.remove(lang)

        if len(languages) > 0:
            raise WrongParameter(", ".join(languages))

        await self.conn.fetchval("""
            UPDATE bdms.codelist
                SET
                    text_cli_en = $1,
                    text_cli_de = $2,
                    text_cli_it = $3,
                    text_cli_fr = $4
            WHERE
                id_cli = $5
        """,
            text['en'],
            text['de'],
            text['it'],
            text['fr'],
            id
        )

        return None
