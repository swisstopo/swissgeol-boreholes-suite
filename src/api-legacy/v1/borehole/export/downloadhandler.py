# -*- coding: utf-8 -*-
from tornado.options import options
from bms.v1.handlers import Admin
import traceback
from bms.v1.exceptions import (
    BmsException,
    AuthenticationException,
)
import datetime

from bms.v1.utils.files import GetFile


class DownloadHandler(Admin):

    async def get(self, *args, **kwargs):
        try:

            if self.user is None:
                raise AuthenticationException()

            self.authorize()

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
                # Initialize GetFile Action
                file_info = await (
                    GetFile(conn)
                ).execute(
                    event_payload['file']
                )

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
