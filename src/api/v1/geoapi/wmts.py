# -*- coding: utf-8 -*-
from bms.v1.handlers import Viewer
from tornado.httpclient import AsyncHTTPClient, HTTPError


class Wmts(Viewer):
    
    async def get(self):
        http_client = AsyncHTTPClient()
        lang = self.get_argument('lang', 'en')
        try:
            self.set_header("Content-Type", "text/xml")
            url = (
                "https://wmts.geo.admin.ch/EPSG/2056/"
                "1.0.0/WMTSCapabilities.xml?lang={}"
            ).format(lang)
            response = await http_client.fetch(url)
            self.write(response.body)

        except HTTPError as e:
            print("Error: " + str(e))

        except Exception as e:
            # Other errors are possible, such as IOError.
            print("Error: " + str(e))

        http_client.close()