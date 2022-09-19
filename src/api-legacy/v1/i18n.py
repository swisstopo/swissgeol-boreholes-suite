# -*- coding: utf-8 -*-
import json


class Action():
    def __init__(self, conn=None, pool=None):
        self.conn = conn
        self.pool = pool
        self.idx = 0

    def decode(self, text):
        return json.loads(text)

    async def execute(self, *arg, **args):
        pass

    def getIdx(self):
        self.idx += 1
        return "$%s" % self.idx
        
