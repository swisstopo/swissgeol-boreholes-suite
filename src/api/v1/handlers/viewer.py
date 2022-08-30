# -*- coding: utf-8 -*-
from bms import (
    BaseHandler,
    AuthorizationException
)


class Viewer(BaseHandler):
    def authorize(self):
        pass
        # if (
        #     'VIEW' not in self.user['roles'] or
        #     'EDIT' not in self.user['roles']
        # ):
        #     raise AuthorizationException()
