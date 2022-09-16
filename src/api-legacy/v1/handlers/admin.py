# -*- coding: utf-8 -*-
from bms import AuthorizationException
from bms.v1.handlers.producer import Producer

class Admin(Producer):

    def authorize(self):

        if self.user['admin']:
            return

        raise AuthorizationException()
