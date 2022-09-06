# -*- coding: utf-8 -*-


class BmsException(Exception):
    def __init__(self, message, code, data = None):
        super().__init__(message)
        self.code = code
        self.data = data


class BmsDatabaseException(BmsException):
    def __init__(self, *arg, **args):
        super().__init__(*arg, **args)

class DatabaseVersionMissmatch(BmsDatabaseException):
    def __init__(self, source_version, database_version):
        super().__init__(
            f"Database version (v{database_version}) missmatch. service-bdms requires (v{source_version})",
            'E-010'
        )

class ActionWrong(BmsException):
    def __init__(self):
        super().__init__("Server error", 'E-000')


class NotFound(BmsException):
    def __init__(self):
        super().__init__("Not found", 'E-050')


class ActionEmpty(BmsException):
    def __init__(self):
        super().__init__("Action empty", 'E-200')


class AuthenticationException(BmsException):
    def __init__(self):
        super().__init__("Authentication error", 'E-102')


class AuthorizationException(BmsException):
    def __init__(self):
        super().__init__("Authorization error", 'E-101')


class WorkgroupFreezed(BmsException):
    def __init__(self):
        super().__init__("Workgroup is freezed", 'E-103')


class DuplicateException(BmsException):
    def __init__(self):
        super().__init__("Record already exists", 'E-104')


class PatchAttributeException(BmsException):
    def __init__(self, attribute):
        super().__init__(f"Attribute \"{attribute}\" unknown", 'E-201')


class MissingParameter(BmsException):
    def __init__(self, parameter):
        super().__init__(f"Missing parameter {parameter}", 'E-203')


class WrongParameter(BmsException):
    def __init__(self, parameter):
        super().__init__(f"Wrong parameter {parameter}", 'E-204')


# Raised when trying to delete row from a referecnced table
class DeleteReferenced(BmsException):
    def __init__(self):
        super().__init__("Foreign key constraint violation", 'E-205')


class Locked(BmsException):
    def __init__(self, id, data):
        super().__init__(
            f"Borehole: '{id}' locked.",
            'errorLocked', data
        )

class ExportAlreadyRunning(BmsException):
    def __init__(self):
        super().__init__("Export Already Running", 'E-206')
