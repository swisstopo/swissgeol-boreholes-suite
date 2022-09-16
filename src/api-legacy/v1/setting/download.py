# -*- coding: utf-8 -*-
from bms.v1.handlers import Admin
from bms.v1.borehole.export import (
    ExportCsv,
    ExportJson,
    ExportSimpleCsv, 
    ExportShapefile,
    ExportSpatiaLite
)
from io import BytesIO
import zipfile
import traceback
from bms.v1.exceptions import (
    BmsException,
    AuthenticationException,
    ActionEmpty,
    MissingParameter
)
import json
import datetime


class DownloadHandler(Admin):
    async def get(self, *args, **kwargs):
        try:

            if self.user is None:
                raise AuthenticationException()

            self.authorize()

            now = datetime.datetime.now()

            self.set_header(
                "Expires",
                datetime.datetime.utcnow() +
                datetime.timedelta(seconds=1)
            )

            self.set_header(
                "Cache-Control",
                "max-age=" + str(1)
            )

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

            arguments = {}
            for key in self.request.query_arguments.keys():
                if self.request.query_arguments[key][0] != b'null':
                    if key == 'extent':
                        coords = self.get_argument(key).split(',')
                        for idx in range(0, len(coords)):
                            coords[idx] = float(coords[idx])
                        arguments[key] = coords
                    elif key == 'format':
                        arguments[key] = self.get_argument(key).split(',')
                    else:
                        arguments[key] = self.get_argument(key)

            out_format = self.get_argument('format', None)

            if out_format is None:
                raise MissingParameter("format")

            async with self.pool.acquire() as conn:

                output = BytesIO()
                output_stream = zipfile.ZipFile(
                    output, mode="w", compression=zipfile.ZIP_DEFLATED
                )

                if out_format == 'text/csv;type=full':

                    action = ExportCsv(conn)
                    csvfile = await action.execute(
                        arguments,
                        user=self.user
                    )

                    output_stream.writestr(
                        'export-%s.csv' % now.strftime(
                                "%Y%m%d%H%M%S"
                        ),
                        csvfile.getvalue()
                    )

                elif out_format in ['text/csv', 'text/csv;type=simple']:

                    action = ExportSimpleCsv(conn)
                    csvfile = await action.execute(
                        arguments,
                        user=self.user
                    )

                    output_stream.writestr(
                        'export-%s.csv' % now.strftime(
                                "%Y%m%d%H%M%S"
                        ),
                        csvfile.getvalue()
                    )

                elif out_format in ['text/json', 'json']:

                    action = ExportJson(conn)
                    jsonfile = await action.execute(
                        arguments,
                        user=self.user
                    )

                    output_stream.writestr(
                        'export-%s.json' % now.strftime(
                                "%Y%m%d%H%M%S"
                        ),
                        jsonfile.getvalue()
                    )

                elif out_format in ['application/spatialite', 'spatialite']:

                    action = ExportSpatiaLite(conn)
                    spatia_lite_file = await action.execute(
                        arguments,
                        user=self.user
                    )

                    if spatia_lite_file:

                        with open(spatia_lite_file.name) as f:

                            output_stream.writestr(
                                'export-%s.db' % now.strftime(
                                        "%Y%m%d%H%M%S"
                                ),
                                f
                            )

                        # spatia_lite_file.close()

                    # raise Exception("application/spatialite")

            output_stream.close()
            self.write(output.getvalue())

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
