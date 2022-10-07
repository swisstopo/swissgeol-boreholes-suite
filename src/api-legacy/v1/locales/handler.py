# -*- coding: utf-8 -*-
import traceback
from tornado import web
from bms.v1.exceptions import (
    AuthenticationException,
)


class LocalesHandler(web.RequestHandler):

    supported=[
        'en', 'it', 'de', 'fr'
    ]
    async def get(self, lng, ns):
        try:
            if lng not in self.supported:
                raise Exception(f"Language {lng} not supported.")

            if lng == 'en':
                self.write(
                    {
                        "welcome": "Welcome to the Jungles!"
                    }
                )

            else:
                self.write(
                    {
                        "welcome": "Benvenuti nella giungla!"
                    }
                )

        except Exception as ex:
            print(traceback.print_exc())
            self.write({
                "success": False,
                "message": "An internal error has occurred!"
            })

        self.finish()