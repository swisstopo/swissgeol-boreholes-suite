# -*- coding: utf-8 -*-
from bms.v1.action import Action


class ListCodeList(Action):

    async def execute(self, schema=None):

        data = {}

        if schema is None:
            recs = await self.conn.fetch("""
                SELECT
                    DISTINCT schema_cli
                FROM
                    bdms.codelist
            """)

        else:
            recs = await self.conn.fetch("""
                SELECT DISTINCT
                    schema_cli,
                    order_cli,
                    id_cli
                FROM
                    bdms.codelist
                WHERE
                    schema_cli = $1
                ORDER BY order_cli, id_cli

            """, schema)

            data[schema] = []

        # Default language
        dl = 'en'
        for rec in recs:
            val = await self.conn.fetchval(f"""
                SELECT
                    array_to_json(
                        array_agg(
                            row_to_json(t)
                        )
                    )
                FROM (
                    SELECT
                        id_cli as id,
                        code_cli as code,
                        (
                            select row_to_json(t)
                            FROM (
                                SELECT
                                    text_cli_en as text
                            ) t
                        ) as en,
                        (
                            select row_to_json(t)
                            FROM (
                                SELECT
                                    COALESCE(
                                        text_cli_de,
                                        text_cli_{dl}
                                    ) as text
                            ) t
                        ) as de,
                        (
                            select row_to_json(t)
                            FROM (
                                SELECT
                                    COALESCE(
                                        text_cli_fr,
                                        text_cli_{dl}
                                    ) as text
                            ) t
                        ) as fr,
                        (
                            select row_to_json(t)
                            FROM (
                                SELECT
                                    COALESCE(
                                        text_cli_it,
                                        text_cli_{dl}
                                    ) as text
                            ) t
                        ) as it,
					    conf_cli as conf,
                        path_cli::text as path,
                        nlevel(path_cli) as level
                    FROM
                        bdms.codelist
                    WHERE
                        schema_cli = $1
                    ORDER BY
                        order_cli, id_cli
                ) AS t
            """, rec[0])
            data[rec[0]] = self.decode(val)

        return {
            "data": data
        }
