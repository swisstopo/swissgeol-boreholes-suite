# -*- coding: utf-8 -*-

VIEW = 0
EDIT = 1
CONTROL = 2
VALID = 3
PUBLIC = 4

from bms.v1.basehandler import BaseHandler
from bms.v1.exceptions import BmsException
from bms.v1.exceptions import BmsDatabaseException
from bms.v1.exceptions import AuthenticationException
from bms.v1.exceptions import AuthorizationException
from bms.v1.exceptions import WorkgroupFreezed
from bms.v1.exceptions import Locked
from bms.v1.exceptions import NotFound
from bms.v1.exceptions import MissingParameter
from bms.v1.exceptions import DuplicateException

# Borehole's ACTION Handlers
from bms.v1.borehole.producer import BoreholeProducerHandler
from bms.v1.borehole.viewer import BoreholeViewerHandler

from bms.v1.setting.handler import SettingHandler

# Terms handlers
from bms.v1.terms.handler import TermsHandler
from bms.v1.terms.admin import TermsAdminHandler

# Actions
from bms.v1.borehole import ListBorehole
from bms.v1.borehole import BoreholeIds
from bms.v1.borehole import GetBorehole
from bms.v1.borehole import PatchBorehole

# User actions
from bms.v1.user.handler import UserHandler
