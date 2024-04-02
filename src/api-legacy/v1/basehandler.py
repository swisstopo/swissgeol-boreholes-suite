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
