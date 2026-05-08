# -*- coding: utf-8 -*-
from tornado import web
import json
import traceback
from bms.v1.exceptions import (
    BmsException,
    AuthenticationException,
    ActionEmpty
)

def merge(source, destination):
    for key, value in source.items():
        if isinstance(value, dict):
            node = destination.setdefault(key, {})
            merge(value, node)
        else:
            destination[key] = value

    return destination

class BaseHandler(web.RequestHandler):

    def __init__(self, *args, **kwargs):
        super(BaseHandler, self).__init__(*args, **kwargs)
        self.user = []

    async def prepare(self):

        auth_header = self.request.headers.get('Authorization')

        if auth_header is None:
            self.set_header('WWW-Authenticate', 'Basic realm=BDMS')
            self.set_status(401)
            self.finish()
            return

        subject_id = auth_header

        async with self.pool.acquire() as conn:

            val = await conn.fetchval("""
                SELECT row_to_json(t)
                FROM (
                    SELECT
                        id_usr as "id",
                        username,
                        CASE
                            WHEN (
                                -- If terms not present and published
                                -- handle user terms as accepted
                                SELECT EXISTS (
                                    SELECT *
                                    FROM
                                        bdms.terms
                                    WHERE
                                        draft IS FALSE
                                    AND
                                        expired IS NULL
                                    LIMIT 1
                                )
                            )
                            THEN COALESCE(
                                tr.terms,
                                FALSE
                            )
                            ELSE
                                TRUE
                        END AS terms,
                        TRUE as viewer,
                        COALESCE(
                            admin_usr, FALSE
                        ) as admin,
                        firstname || ' ' || lastname as "name",
                        COALESCE(
                            settings_usr::json,
                            value_cfg::json
                        ) as setting,
                        COALESCE(
                            w.ws, '[]'::json
                        ) AS workgroups,
                        COALESCE(
                            w.wgps, '{}'::int[]
                        ) AS wid,
                        COALESCE(
                            rl.roles, '{}'::character varying[]
                        ) AS roles
                    FROM
                        bdms.users

                    INNER JOIN bdms.config
                    ON name_cfg = 'SETTINGS'

                    LEFT JOIN (
                        SELECT
                            r.user_id,
                            array_agg(r.name_rol) AS roles
                        FROM (
                            SELECT distinct
                                user_id,
                                name_rol
                            FROM
                                bdms.users_roles,
                                bdms.roles,
                                bdms.workgroups
                            WHERE
                                id_rol = role_id
                            AND
                                id = workgroup_id
                        ) r
                        GROUP BY user_id
                    ) as rl
                    ON rl.user_id = id_usr

                    LEFT JOIN (
                        SELECT
                            user_id,
                            TRUE as terms
                        FROM
                            bdms.terms_accepted
                        INNER JOIN
                            bdms.terms
                        ON
                            term_id = id
                        WHERE
                            expired IS NULL
                        AND
                            draft IS FALSE
                    ) as tr
                    ON
                        tr.user_id = id_usr

                    LEFT JOIN (
                        SELECT
                            user_id,
                            array_agg(id) as wgps,
                            array_to_json(array_agg(j)) as ws
                        FROM (
                            SELECT
                                user_id,
                                id,
                                json_build_object(
                                    'id', id,
                                    'workgroup', name,
                                    'roles', array_agg(name_rol),
                                    'disabled', disabled
                                ) as j
                            FROM
                                bdms.users_roles,
                                bdms.workgroups,
                                bdms.roles
                            WHERE
                                id_rol = role_id
                            AND
                                workgroup_id = id
                            GROUP BY
                                user_id,
                                id
                            ORDER BY
                                name
                        ) AS t
                        GROUP BY user_id
                    ) as w
                    ON w.user_id = id_usr

                    WHERE
                        subject_id = $1
                    AND
                        disabled_usr IS NULL
                ) as t
            """, subject_id)

            if val is None:
                self.set_status(401)
                self.finish()
                return

            self.user = json.loads(val)

    @property
    def pool(self):
        return self.application.pool

    async def post(self, *args, **kwargs):
        try:
            self.set_header("Content-Type", "application/json; charset=utf-8")
            if self.user is None:
                raise AuthenticationException()

            self.authorize()
            body = self.request.body.decode('utf-8')
            if body is None or body == '':
                raise ActionEmpty()

            response = await self.execute(
                json.loads(body)
            )

            if response is None:
                response = {}

            self.write({
                **{"success": True},
                **response
            })

        except BmsException as bex:
            print(traceback.print_exc())
            self.write({
                "success": False,
                "message": "An internal error has occurred!",
                "error": bex.code,
                "data": bex.data
            })

        except Exception as ex:
            print(traceback.print_exc())
            self.write({
                "success": False,
                "message": "An internal error has occurred!"
            })

        self.finish()

    def authorize(self):
        pass

    async def get(self, *args, **kwargs):
        self.write("Method not supported")
        self.finish()

    async def execute(self, request):
        return {
            "message": "execute function not implemented"
        }
