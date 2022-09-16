# -*- coding: utf-8 -*-
from tornado.platform.asyncio import to_tornado_future
from asyncio import ensure_future
import functools


def coroutine(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return to_tornado_future(ensure_future(func(*args, **kwargs)))
    return wrapper
