# -*- coding: utf-8 -*-
from tornado.options import options
from bms.v1.handlers import Producer
from bms.v1.utils import SaveFile
from bms.v1.borehole import (
    DetachFile,
    PatchFile
)
from io import BytesIO
import traceback
from bms.v1.exceptions import (
    BmsException,
    AuthorizationException,
    AuthenticationException,
    NotFound
)
import datetime
from bms.v1.utils.files import DeleteFile, GetFile


class FileHandler(Producer):

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

                borehole_id = int(self.get_body_argument('id'))

                if self.user is None:
                    raise AuthenticationException()

                self.authorize()

                async with self.pool.acquire() as conn:

                    # Initialize Save File Action
                    save_file = SaveFile(conn)

                    await conn.execute("BEGIN;")

                    # Loop throught upload files
                    for files in self.request.files.items():
                        for info in files[1]:

                            # Save file using the SaveFile action
                            file = await save_file.execute(
                                info["filename"],
                                info["content_type"],
                                BytesIO(info["body"]),
                                self.user
                            )

                            # Attach the uploaded file to borehole
                            await conn.execute(
                                """
                                    INSERT INTO bdms.borehole_files (
                                        id_bho_fk, id_fil_fk, id_usr_fk
                                    ) VALUES (
                                        $1, $2, $3
                                    );
                                """, borehole_id, file["id_fil"], self.user['id']
                            )

                    await conn.execute("COMMIT;")

                self.write({
                    "success": True
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
                FileHandler, self
            ).post(*args, **kwargs)


    async def get(self, *args, **kwargs):
        try:

            if self.user is None:
                raise AuthenticationException()

            self.authorize()

            file_id = int(self.get_argument('id', 0))

            if file_id == 0:
                raise NotFound()

            self.set_header(
                "Expires",
                datetime.datetime.utcnow() +
                datetime.timedelta(seconds=1)
            )

            self.set_header(
                "Cache-Control",
                "max-age=" + str(1)
            )

            async with self.pool.acquire() as conn:

                # Get file
                file_info = await (
                    GetFile(conn)
                ).execute(
                    file_id
                )

                self.set_header("Content-Type", file_info['contentType'])
                self.set_header("Content-Disposition", f"inline; {file_info['name']}")

                self.write(file_info['file'].getvalue())

        except BmsException as bex:
            print(traceback.print_exc())
            self.write({
                "success": False,
                "message": str(bex),
                "error": bex.code
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
            'DETACHFILE',
            'PATCH'
        ]:
            async with self.pool.acquire() as conn:

                exe = None

                # Lock check
                res = await self.check_lock(
                    request['id'], self.user, conn
                )

                if (
                    action in [
                        'DETACHFILE',
                        'PATCH'
                    ]
                ):
                    await self.check_edit(
                        request['id'], self.user, conn
                    )
                    if res['role'] != 'EDIT':
                        raise AuthorizationException() 

                if action == 'DETACHFILE':
                    exe = DetachFile(conn)
                    request['user'] = self.user

                elif action == 'PATCH':
                    exe = PatchFile(conn)
                    request['user'] = self.user

                request.pop('lang', None)

                if exe is not None:

                    ret = await exe.execute(**request)

                    if action == 'DETACHFILE':

                        # Check if the file is still linked to some
                        #  other borehole
                        val = await conn.fetchrow("""
                            SELECT
								COALESCE(cnt, 0) cnt,
                                name_uuid_fil
                            FROM
                                bdms.files
                            LEFT JOIN (
                                SELECT
                                    id_fil_fk,
                                    COUNT(id_fil_fk) as cnt
                                FROM
                                    bdms.borehole_files
                                GROUP BY
                                    id_fil_fk
                            ) as cntr
                            ON
                                id_fil_fk = id_fil
                            WHERE
                                id_fil = $1
                        """, request['file_id'])

                        # If the file is unlinked from all boreholes then
                        #  delete it
                        if val[0] == 0:
                            await (
                                DeleteFile(conn)
                            ).execute(
                                request['file_id']
                            )

                    return ret

        raise Exception("Action '%s' unknown" % action)
