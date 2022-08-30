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

            # if self.user is None:
            #     raise AuthenticationException()

            # self.authorize()

            if lng not in self.supported:
                raise Exception(f"Language {lng} not supported.")

            # async with self.pool.acquire() as conn:

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

            # self.write(
            #     {
            #         "en" : {
            #             "commons": {
            #                 "welcome": "Welcome to the Jungles!"
            #             }
            #         }
            #     }
            # )

        except Exception as ex:
            print(traceback.print_exc())
            self.write({
                "success": False,
                "message": str(ex)
            })

        self.finish()