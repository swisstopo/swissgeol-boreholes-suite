# -*- coding: utf-8 -*-
from bms import (
    AuthorizationException
)
from bms.v1.handlers import Viewer


class UserHandler(Viewer):
    async def execute(self, request):

        action = request.pop('action', None)

        if action in [
            'GET', 'RELOAD'
        ]:

            workgroups = []
            roles = []

            for workgroup in self.user['workgroups']:
                if workgroup['disabled'] is not None:
                    workgroup['roles'] = ['VIEW']
                
                workgroups.append(workgroup)
            
                for role in workgroup['roles']:
                    if role not in roles:
                        roles.append(role)

            return {
                "data": {
                    "admin": self.user['admin'],
                    "name": self.user['name'],
                    "roles": roles,
                    "terms": self.user['terms'],
                    "username": self.user['username'],
                    "viewer": self.user['viewer'],
                    "workgroups": workgroups
                }
            }

        raise Exception("Action '%s' unknown" % action)
