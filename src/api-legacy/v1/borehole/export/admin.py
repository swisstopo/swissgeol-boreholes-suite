# -*- coding: utf-8 -*-
from bms.v1.borehole.export.cancel import ExportCancel
from bms.v1.borehole.export.status import ExportStatus
from bms.v1.user.workgrpup.role import SetRole
from bms.v1.user.workgrpup.create import CreateWorkgroup
from tornado.options import options
import traceback
import datetime
from io import BytesIO
import zipfile
from bms.v1.exceptions import ActionEmpty, AuthenticationException, BmsException, NotFound
import json
from bms.v1.handlers import Admin
from bms.v1.borehole.export import (
    ExportSpatiaLite,
    NotifyExportSpatialLiteAsync
)
from bms.v1.borehole.export.importer import Importer
from bms.v1.utils.files import GetFile


class ExportAdminHandler(Admin):

    async def post(self, *args, **kwargs):

        try:
            if self.user is None:
                raise AuthenticationException()

            self.authorize()
            body = self.request.body.decode('utf-8')

            if body is None or body == '':
                raise ActionEmpty()

            payload = json.loads(body)
            action = payload['action']
            response = await self.execute(payload)

            if action in ['EXPORT', 'EXPORT_BY_ID']:

                now = datetime.datetime.now()

                self.set_header(
                    "Content-Type",
                    "application/zip"
                )

                self.set_header(
                    "Content-Disposition",
                    "inline; filename=bdms-export-%s.zip" % now.strftime(
                        "%Y%m%d%H%M%S"
                    )
                )

                output = BytesIO()
                output_stream = zipfile.ZipFile(
                    output, mode="w", compression=zipfile.ZIP_DEFLATED
                )

                if response:
                    output_stream.writestr(
                        'swissforages.gpkg', response.getvalue()
                    )

                    async with self.pool.acquire() as conn:

                        widx = 1
                        where = []
                        arguments = []
                        if 'workgroup' in payload and payload['workgroup'] != 'all':

                            widx = 1
                            andId = []
                            for id in payload['workgroup']:
                                andId.append(f"""
                                    id_wgp_fk = ${widx}
                                """)
                                arguments.append(id)
                                widx += 1

                            where.append(f"""(
                                {' OR '.join(andId)}
                            )""")
                            # where.append(f"""
                            #     id_wgp_fk = ${widx}
                            # """)
                            # widx += 1
                            # arguments.append(payload['workgroup'])

                        if 'ids' in payload:
                            widx = 1
                            andId = []
                            for id in payload['ids']:
                                andId.append(f"""
                                    borehole.id_bho = ${widx}
                                """)
                                arguments.append(id)
                                widx += 1

                            where.append(f"""(
                                {' OR '.join(andId)}
                            )""")
                        
                        stringWhere = ''

                        if len(where) > 0:
                            stringWhere = f"""
                                WHERE
                                    {' AND '.join(where)}
                            """

                        rows = await conn.fetch(f"""
                            SELECT
                                id_fil

                            FROM
                                bdms.files

                            INNER JOIN
                                bdms.borehole_files
                            ON
                                id_fil_fk = id_fil
								
							INNER JOIN
                                bdms.borehole
							ON
								id_bho = id_bho_fk
                            
                            {stringWhere}
                        """, *arguments)

                        not_found = []

                        # for row in rows:

                        #     if row is None:
                        #         raise NotFound()

                        #     try:
                        #         attachment = await (
                        #             GetFile(conn)
                        #         ).execute(row[0])

                        #         output_stream.writestr(
                        #             f'files/{attachment["conf"]["key"]}',
                        #             attachment['file'].getvalue()
                        #         )

                        #     except Exception as ce:
                        #         if ce.response['Error']['Code'] == '404':
                        #             not_found.append(conf['key'])
                        #             continue

                        #         raise Exception(
                        #             "Error while downloading from AWS"
                        #         )

                        if len(not_found) > 0:
                            print(f"\033[91m{len(not_found)} files not found 🤔\033[0m")

                else:
                    raise Exception("Unknown error")

                output_stream.close()
                self.write(output.getvalue())

            else:
                self.set_header(
                    "Content-Type",
                    "application/json; charset=utf-8"
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
                "message": str(bex),
                "error": bex.code,
                "data": bex.data
            })

        except Exception as ex:
            print(traceback.print_exc())
            self.write({
                "success": False,
                "message": str(ex)
            })

        self.finish()
        
    async def execute(self, request):
        action = request.pop('action', None)

        if action in [
            'EXPORT',
            'EXPORT_BY_ID',
            'EXPORT_STATUS',
            'EXPORT_CANCEL',
            'DATABASE.EXPORT',
        ]:

            async with self.pool.acquire() as conn:

                exe = None

                if action == 'EXPORT':
                    exe = ExportSpatiaLite(conn)

                elif action == 'EXPORT_BY_ID':
                    exe = ExportSpatiaLite(conn)

                elif action == 'EXPORT_STATUS':
                    exe = ExportStatus(conn)

                elif action == 'EXPORT_CANCEL':
                    exe = ExportCancel(conn)

                elif action == 'DATABASE.EXPORT':
                    exe = NotifyExportSpatialLiteAsync(conn)
                    request['user'] = self.user

                if exe is not None:
                    return (
                        await exe.execute(**request)
                    )                       

        raise Exception("Action '%s' unknown" % action)


class ImportAdminHandler(Admin):

    # Uploading files
    async def post(self, *args, **kwargs):
        if (
            'Content-Type' in self.request.headers and
            'multipart/form-data' in self.request.headers['Content-Type']
        ):
            try:
                self.set_header(
                    "Content-Type",
                    "application/json; charset=utf-8"
                )
                if self.user is None:
                    raise AuthenticationException()

                self.authorize()

                async with self.pool.acquire() as conn:
                    try:
                        await conn.execute("BEGIN;")

                        action = self.get_body_argument('action')

                        if action == 'IMPORT_INTO_NEW_SUPPLIER':
                            result = await (
                                CreateWorkgroup(conn)
                            ).execute(
                               self.get_body_argument('name'), True
                            )
                            workgroup_id = result['id']
                            
                            set_role = SetRole(conn)
                            result = await set_role.execute(
                               self.user['id'], workgroup_id, 'VIEW'
                            )
                            result = await set_role.execute(
                               self.user['id'], workgroup_id, 'PUBLIC'
                            )

                        elif action in [
                            'IMPORT_INTO_SUPPLIER',
                            'IMPORT_INTO_WORKGROUP'
                        ]:
                            workgroup_id = int(self.get_body_argument('id'))

                        for files in self.request.files.items():
                            for info in files[1]:
                                archive = BytesIO(info["body"])
                                result = await (
                                    Importer(conn)
                                ).execute(
                                    self.user, workgroup_id, archive
                                )
                                break
                            break

                        await conn.execute("COMMIT;")

                    except Exception as ex:
                        print(traceback.print_exc())
                        await conn.execute("ROLLBACK;")
                        raise ex

            except BmsException as bex:
                print(traceback.print_exc())
                self.write({
                    "success": False,
                    "message": str(bex),
                    "error": bex.code,
                    "data": bex.data
                })

            except Exception as ex:
                print(traceback.print_exc())
                self.write({
                    "success": False,
                    "message": str(ex)
                })

            self.finish()

        else:
            await super(
                ImportAdminHandler, self
            ).post(*args, **kwargs)
        
    async def execute(self, request):
        action = request.pop('action', None)

        if action in [
            'EXPORT',
            'IMPORT'
        ]:

            async with self.pool.acquire() as conn:

                exe = None

                if action == 'EXPORT':
                    exe = ExportSpatiaLite(conn)

                    # Add user parameter to request
                    request['user'] = self.user['username']

                if exe is not None:
                    return (
                        await exe.execute(**request)
                    )                       

        raise Exception("Action '%s' unknown" % action)
