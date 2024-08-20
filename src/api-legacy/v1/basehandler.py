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
                                        draft_tes IS FALSE
                                    AND
                                        expired_tes IS NULL
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
                            r.id_usr_fk,
                            array_agg(r.name_rol) AS roles
                        FROM (
                            SELECT distinct
                                id_usr_fk,
                                name_rol
                            FROM
                                bdms.users_roles,
                                bdms.roles,
                                bdms.workgroups
                            WHERE
                                id_rol = id_rol_fk
                            AND
                                id_wgp = id_wgp_fk
                        ) r
                        GROUP BY id_usr_fk
                    ) as rl
                    ON rl.id_usr_fk = id_usr

                    LEFT JOIN (
                        SELECT
                            id_usr_fk,
                            TRUE as terms
                        FROM
                            bdms.terms_accepted
                        INNER JOIN
                            bdms.terms
                        ON
                            id_tes_fk = id_tes
                        WHERE
                            expired_tes IS NULL
                        AND
                            draft_tes IS FALSE
                    ) as tr
                    ON
                        tr.id_usr_fk = id_usr

                    LEFT JOIN (
                        SELECT
                            id_usr_fk,
                            array_agg(id_wgp) as wgps,
                            array_to_json(array_agg(j)) as ws
                        FROM (
                            SELECT
                                id_usr_fk,
                                id_wgp,
                                json_build_object(
                                    'id', id_wgp,
                                    'workgroup', name_wgp,
                                    'roles', array_agg(name_rol),
                                    'disabled', disabled_wgp
                                ) as j
                            FROM
                                bdms.users_roles,
                                bdms.workgroups,
                                bdms.roles
                            WHERE
                                id_rol = id_rol_fk
                            AND
                                id_wgp_fk = id_wgp
                            GROUP BY
                                id_usr_fk,
                                id_wgp
                            ORDER BY
                                name_wgp
                        ) AS t
                        GROUP BY id_usr_fk
                    ) as w
                    ON w.id_usr_fk = id_usr

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
