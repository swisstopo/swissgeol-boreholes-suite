# -*- coding: utf-8 -*-
from bms import EDIT
from bms.v1.action import Action
from bms.v1.exceptions import (
    MissingParameter,
    WrongParameter
)


class CreateIdentifier(Action):

    async def execute(self, text):

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

        bid = await self.conn.fetchval("""
            INSERT INTO bdms.codelist(
                code_cli,
                text_cli_en,
                text_cli_de,
                text_cli_fr,
                text_cli_it,
                description_cli_en,
                schema_cli
            ) VALUES (
                '',
                $1,
                $2,
                $3,
                $4,
                ' ',
                'borehole_identifier'
            )
            RETURNING
                id_cli
        """,
            text['en'],
            text['de'],
            text['it'],
            text['fr']
        )

        await self.conn.fetchval("""
            UPDATE bdms.codelist
                SET
                    code_cli = id_cli,
                    geolcode = id_cli
            WHERE
                id_cli = $1
        """, bid)

        return {
            "id": bid
        }
