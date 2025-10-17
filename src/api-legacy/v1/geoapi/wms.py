# -*- coding: utf-8 -*-
from bms.v1.handlers import Viewer
from tornado.httpclient import (
    AsyncHTTPClient,
    HTTPError,
    HTTPRequest
)


class Wms(Viewer):

    async def get(self):
        http_client = AsyncHTTPClient()
        lang = self.get_argument('lang', 'en')
        url = self.get_argument(
            'url',
            (
                "https://wms.geo.admin.ch?"
                "request=getCapabilities&service=WMS&lang={}"
            )
        )
        try:
            self.set_header("Content-Type", "text/xml")

            if 'lang={}' in url:
                url = url.format(lang)

            elif 'lang=' not in url:
                url = f'{url}&lang={lang}'

            response = await http_client.fetch(
                HTTPRequest(
                    url=url
                )
            )
            self.write(response.body)

        except HTTPError as e:
            print(" > Error: " + str(e))

        except Exception as e:
            # Other errors are possible, such as IOError.
            print(" > Error: " + str(e))

        http_client.close()
