# -*- coding: utf-8 -*-
from bms.v1.handlers import Viewer
from bms.v1.borehole import ExportBorehole
from io import StringIO
import traceback
import csv
from bms.v1.exceptions import (
    BmsException,
    AuthenticationException,
    ActionEmpty
)
import json
import datetime

class BoreholeExporterHandler(Viewer):
    async def get(self, *args, **kwargs):
        try:
            self.set_header(
                "Content-Type",
                "text/csv"
            )

            now = datetime.datetime.now()

            self.set_header(
                "Content-Disposition",
                "inline; filename=export-%s.csv" % now.strftime(
                        "%Y%m%d%H%M%S"
                )
            )

            self.set_header(
                "Expires",
                datetime.datetime.utcnow() +
                datetime.timedelta(seconds=1)
            )

            self.set_header(
                "Cache-Control",
                "max-age=" + str(1)
            )

            if self.user is None:
                raise AuthenticationException()

            self.authorize()

            arguments = {}
            for key in self.request.query_arguments.keys():
                if self.request.query_arguments[key][0] != b'null':
                    if key == 'extent':
                        coords = self.get_argument(key).split(',')
                        for idx in range(0, len(coords)):
                            coords[idx] = float(coords[idx])
                        arguments[key] = coords
                    else:
                        arguments[key] = self.get_argument(key)

            async with self.pool.acquire() as conn:
                action = ExportBorehole(conn)
                if arguments is None:
                    result = await action.execute()
                else:
                    result = await action.execute(filter=arguments)
                data = result['data']
                if len(data) > 0:
                    csvfile = StringIO()
                    cw = csv.writer(
                        csvfile,
                        delimiter=';',
                        quotechar='"'
                    )
                    cols = data[0].keys()
                    cw.writerow(cols)

                    for row in data:
                        r = []
                        for col in cols:
                            r.append(row[col])
                        cw.writerow(r)

                    self.write(csvfile.getvalue())

                else:
                    self.write("no data")

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

    async def post(self, *args, **kwargs):
        try:
            self.set_header("Content-Type", "text/csv")
            if self.user is None:
                raise AuthenticationException()

            self.authorize()
            body = self.request.body.decode('utf-8')
            if body is None or body == '':
                raise ActionEmpty()

            async with self.pool.acquire() as conn:
                action = ExportBorehole(conn)
                result = await action.execute(**json.loads(body))
                data = result['data']
                if len(data) > 0:
                    csvfile = StringIO()
                    cw = csv.writer(
                        csvfile,
                        delimiter=';',
                        quotechar='"'
                    )
                    cols = data[0].keys()
                    cw.writerow(cols)

                    for row in data:
                        r = []
                        for col in cols:
                            r.append(row[col])
                        cw.writerow(r)

                    self.write(csvfile.getvalue())

                else:
                    self.write("no data")

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
