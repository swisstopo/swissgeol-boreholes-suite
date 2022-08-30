# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.borehole.codelist import ListCodeList
import math


class ListIdentifiers(Action):
    async def execute(self):
        ls = ListCodeList(self.conn)
        return (
            await ls.execute('borehole_identifier')
        )
