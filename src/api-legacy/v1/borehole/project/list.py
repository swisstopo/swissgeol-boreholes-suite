# -*- coding: utf-8 -*-
from bms.v1.action import Action
import math


class ListProject(Action):

    async def execute(self, limit=None, page=None, name=None):

        paging = ''
        pagingParams = []
        params = []
        where = []

        if name is not None:
            params.append("%%%s%%" % name)
            where.append("""
                name_pro LIKE $1
            """)

            if limit is not None and page is not None:
                paging = """
                    LIMIT $2
                    OFFSET $3
                """
                pagingParams = [
                    limit, (int(limit) * (int(page) - 1))
                ]

        elif limit is not None and page is not None:
            paging = """
                LIMIT $1
                OFFSET $2
            """
            pagingParams = [
                limit, (int(limit) * (int(page) - 1))
            ]

        rowsSql = """
            SELECT
                id_pro as id,
                name_pro as name
            FROM
                bdms.project
        """

        cntSql = """
            SELECT count(*) AS cnt
            FROM bdms.project
        """

        if len(where) > 0:
            rowsSql += """
                WHERE %s
            """ % " AND ".join(where)
            cntSql += """
                WHERE %s
            """ % " AND ".join(where)

        sql = """
            SELECT
                array_to_json(
                    array_agg(
                        row_to_json(t)
                    )
                ),
                COALESCE((
                    %s
                ), 0)
            FROM (
                %s
                %s
            ) AS t
        """ % (cntSql, rowsSql, paging)

        rec = await self.conn.fetchrow(
            sql, *(params + pagingParams)
        )
        return {
            "data": self.decode(rec[0]) if rec[0] is not None else [],
            "page": page if page is not None else 1,
            "pages": math.ceil(rec[1]/limit) if limit is not None else 1,
            "rows": rec[1]
        }
