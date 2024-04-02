# -*- coding: utf-8 -*-
"""This is the entry point to run the BDMS as a TornadoWeb service.
"""

__author__ = 'Institute of Earth science - SUPSI'

# Database version
__version__ = '1.0.6'

from tornado import web
from tornado.options import define, options
from tornado.platform.asyncio import AsyncIOMainLoop
import asyncio
import asyncpg
from tornado.httpserver import HTTPServer
import sys
from pathlib import Path
import traceback

sys.path.append('.')

define("port", default=8888, help="Tornado Web port", type=int)

define("pg_user", default=None, help="PostgreSQL database user")
define("pg_password", default=None, help="PostgreSQL user password")
define("pg_host", default=None, help="PostgreSQL database host")
define("pg_port", default="5432", help="PostgreSQL database port")
define("pg_database", default=None, help="PostgreSQL database name")

# Ordered list of upgradable versions
versions = [
    "1.0.0",
    "1.0.1",
    "1.0.2",
    "1.0.3",
    "1.0.4",
    "1.0.5",
    "1.0.6-beta.1"
]

# SQL upgrades directory
udir = "./bms/assets/sql/"

# SQL to execute for upgrades
sql_files = {
    "1.0.0": f"{udir}1.0.0_to_1.0.1.sql",
    "1.0.1": f"{udir}1.0.1_to_1.0.2.sql",
    "1.0.2": f"{udir}1.0.2_to_1.0.3.sql",
    "1.0.3": f"{udir}1.0.3_to_1.0.4.sql",
    "1.0.4": f"{udir}1.0.4_to_1.0.5.sql",
    "1.0.5": f"{udir}1.0.5_to_1.0.6-beta.1.sql",
    "1.0.6-beta.1": f"{udir}1.0.6-beta.1_to_1.0.6-beta.2.sql",
}

listeners = []

async def get_conn():
    try:
        return await asyncpg.create_pool(
            user=options.pg_user,
            password=options.pg_password,
            database=options.pg_database,
            host=options.pg_host,
            port=options.pg_port
        )
    except Exception as x:
        red("Connection to PostgreSQL: failed.\n")
        raise x

def red(message):
    print(f"\033[91m{message}\033[0m")

def green(message):
    print(f"\033[92m{message}\033[0m")

def blue(message):
    print(f"\033[94m{message}\033[0m")

async def close(application):
    # Remove all listeners
    blue("Removing listeners..")
    await application.listener.stop()
    green(" > done.")

    blue("Closing connection pool..")
    # Closing connections pool
    await application.pool.close()
    green(" > done.")

    print("")

if __name__ == "__main__":

    # ASCII ART created using web app
    # http://patorjk.com/software/taag/#p=display&f=Big&t=swissforages
    print("""
\033[91m              _          __                                \033[0m
\033[91m             (_)        / _|                               \033[0m
\033[91m _____      ___ ___ ___| |_ ___  _ __ __ _  __ _  ___  ___ \033[0m
\033[91m/ __\ \ /\ / / / __/ __|  _/ _ \| '__/ _` |/ _` |/ _ \/ __|\033[0m
\033[91m\__ \\\\ V  V /| \__ \__ \ || (_) | | | (_| | (_| |  __/\__ \\\033[0m
\033[91m|___/ \_/\_/ |_|___/___/_| \___/|_|  \__,_|\__, |\___||___/\033[0m
\033[91m                                            __/ |          \033[0m
\033[91m                                           |___/           \033[0m
    """)

    options.parse_command_line()

    from bms import (

        # Exceptions
        BmsDatabaseException,

        # user handlers
        SettingHandler,
        UserHandler,
        AdminHandler,
        WorkgroupAdminHandler,

        # Borehole handlers
        BoreholeViewerHandler,
        BoreholeProducerHandler,

        # Identifier handlers
        IdentifierAdminHandler,
        IdentifierProducerHandler,
        IdentifierViewerHandler,

        # Layer handlers
        LayerViewerHandler,
        LayerProducerHandler,

        # Layer handlers
        ProfileLayerViewerHandler,

        # Workflow handlers
        WorkflowProducerHandler,

        # Terms handlers
        TermsHandler,
        TermsAdminHandler,

        # Other handlers
        CodeListHandler,
        Wms,
    )

    AsyncIOMainLoop().install()
    ioloop = asyncio.get_event_loop()

    settings = dict(
        debug=True
    )

    application = web.Application([

        (r'/api/v1/setting', SettingHandler),

        # User handlers
        (r'/api/v1/user', UserHandler),
        (r'/api/v1/user/edit', AdminHandler),

        (r'/api/v1/user/workgroup/edit', WorkgroupAdminHandler),

        # Borehole handlers
        (r'/api/v1/borehole', BoreholeViewerHandler),
        (r'/api/v1/borehole/edit', BoreholeProducerHandler),

        # Stratigraphy handlers
        (r'/api/v1/borehole/identifier', IdentifierViewerHandler),
        (r'/api/v1/borehole/identifier/edit', IdentifierProducerHandler),
        (r'/api/v1/borehole/identifier/admin', IdentifierAdminHandler),

        # Workflow handlers
        (r'/api/v1/workflow/edit', WorkflowProducerHandler),

        # Terms handlers
        (r'/api/v1/terms', TermsHandler),
        (r'/api/v1/terms/admin', TermsAdminHandler),

        # Layer handlers (will be deprecated)
        (r'/api/v1/borehole/stratigraphy/layer', LayerViewerHandler),
        (r'/api/v1/borehole/stratigraphy/layer/edit', LayerProducerHandler),

        # Profile Layer handlers
        (r'/api/v1/borehole/profile/layer', ProfileLayerViewerHandler),

        # Other handlers
        (r'/api/v1/borehole/codes', CodeListHandler),
        (r"/api/v1/geoapi/wms/swisstopo", Wms),

    ], **settings)

    # Init database postgresql connection pool
    application.pool = ioloop.run_until_complete(get_conn())
    green("Connection to PostgreSQL database: Ok")

    try:
        http_server = HTTPServer(application)
        http_server.listen(options.port, '0.0.0.0')
        blue(f"\n🤖 Server ready: http://0.0.0.0:{options.port}\n")

        ioloop.run_forever()

    except BmsDatabaseException as du:
        print(f"\n 😃 \033[92m{du}\033[0m\n")

    except Exception as ex:
        print(traceback.print_exc())

    except KeyboardInterrupt:
        red("\nKeyboard interruption, probably: CTR+C\n")

    finally:
        ioloop.run_until_complete(close(application))
