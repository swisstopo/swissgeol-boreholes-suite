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
from minio.error import S3Error
from tornado.httpserver import HTTPServer
import sys
from pathlib import Path
import traceback

sys.path.append('.')

from bms.v1.listeners import EventListener
from bms.v1.utils.files import FileBase

define("port", default=8888, help="Tornado Web port", type=int)

define("pg_user", default=None, help="PostgrSQL database user")
define("pg_password", default=None, help="PostgrSQL user password")
define("pg_host", default=None, help="PostgrSQL database host")
define("pg_port", default="5432", help="PostgrSQL database port")
define("pg_database", default=None, help="PostgrSQL database name")

# Generic S3 storage for files configuration
define("s3_endpoint", default=None, help="Select S3 Bucket name", type=str)
define("s3_bucket-name", default=None, help="Select S3 Bucket name", type=str)
define("s3_region", default=None, help="(Optional, default null) Region name of buckets in S3 service.", type=str)
define("s3_access_key", default=None, help="S3 access key", type=str)
define("s3_secret_key", default=None, help="S3 secret key", type=str)
define("s3_secure", default=True, help="(Default True) Flag to indicate to use secure (TLS) connection to S3 service or not.", type=bool)

# SMTP send mail configuration
define("smtp_recipients", default=None, help="SMTP comma separated recipients email addresses", type=str)
define("smtp_sender", default=None, help="SMTP sender respectively username", type=str)
define("smtp_password", default=None, help="SMTP password", type=str)
define("smtp_server", default=None, help="SMTP server address", type=str)
define("smtp_port", default=25, help="SMTP server port", type=int)
define("smtp_tls", default=False, help="SMTP server supports direct connection via TLS/SSL", type=bool)
define("smtp_starttls", default=False, help="SMTP servers support the STARTTLS extension", type=bool)

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
        # Internationalization
        LocalesHandler,

        # Exceptions
        BmsDatabaseException,
        DatabaseVersionMissmatch,

        # user handlers
        SettingHandler,
        DownloadHandler,
        UserHandler,
        AdminHandler,
        WorkgroupAdminHandler,

        # Borehole handlers
        BoreholeViewerHandler,
        BoreholeProducerHandler,
        ExportHandler,
        ExportAdminHandler,
        ImportAdminHandler,
        FileHandler,

        # Identifier handlers
        IdentifierAdminHandler,
        IdentifierProducerHandler,
        IdentifierViewerHandler,

        # Stratigraphy handlers
        StratigraphyViewerHandler,
        StratigraphyProducerHandler,

        # Layer handlers
        LayerViewerHandler,
        LayerProducerHandler,

        # Profile handlers
        ProfileViewerHandler,
        ProfileProducerHandler,

        # Layer handlers
        ProfileLayerViewerHandler,

        # Workflow handlers
        WorkflowProducerHandler,

        # Content handlers
        ContentHandler,
        ContentAdminHandler,

        # Terms handlers
        TermsHandler,
        TermsAdminHandler,

        # Feedback handler
        FeedbackHandler,

        # Other handlers
        GeoapiHandler,
        ProjectHandler,
        CodeListHandler,
        MunicipalityHandler,
        CantonHandler,
        Wmts,
        Wms,
    )

    AsyncIOMainLoop().install()
    ioloop = asyncio.get_event_loop()

    settings = dict(
        debug=True
    )

    application = web.Application([

        # Translations service
        (r'/api/v1/locale/(?P<lng>.+)/(?P<ns>\w*)', LocalesHandler),

        # Borehole handlers
        (r'/api/v1/setting', SettingHandler),
        (r'/api/v1/setting/download', DownloadHandler),
        (r'/api/v1/setting/export', ExportAdminHandler),
        (r'/api/v1/setting/import', ImportAdminHandler),
        (r'/api/v1/user', UserHandler),
        (r'/api/v1/user/edit', AdminHandler),

        (r'/api/v1/user/workgroup/edit', WorkgroupAdminHandler),

        # Borehole handlers
        (r'/api/v1/borehole', BoreholeViewerHandler),
        (r'/api/v1/borehole/edit', BoreholeProducerHandler),
        (r'/api/v1/borehole/download', ExportHandler),
        (r'/api/v1/borehole/edit/import', BoreholeProducerHandler),
        (r'/api/v1/borehole/edit/files', FileHandler),

        # Stratigraphy handlers
        (r'/api/v1/borehole/identifier', IdentifierViewerHandler),
        (r'/api/v1/borehole/identifier/edit', IdentifierProducerHandler),
        (r'/api/v1/borehole/identifier/admin', IdentifierAdminHandler),

        # Workflow handlers
        (r'/api/v1/workflow/edit', WorkflowProducerHandler),

        # Content handlers
        (r'/api/v1/content/admin', ContentAdminHandler),
        (r'/api/v1/content', ContentHandler),
        (r'/api/v1/content/(.*)', ContentHandler),

        # Terms handlers
        (r'/api/v1/terms', TermsHandler),
        (r'/api/v1/terms/admin', TermsAdminHandler),

        # FEEDBACK handlers
        (r'/api/v1/feedback', FeedbackHandler),

        # Stratigraphy handlers (will be deprecated)
        (r'/api/v1/borehole/stratigraphy', StratigraphyViewerHandler),
        (r'/api/v1/borehole/stratigraphy/edit', StratigraphyProducerHandler),

        # Layer handlers (will be deprecated)
        (r'/api/v1/borehole/stratigraphy/layer', LayerViewerHandler),
        (r'/api/v1/borehole/stratigraphy/layer/edit', LayerProducerHandler),

        # Profile handlers
        (r'/api/v1/borehole/profile', ProfileViewerHandler),
        (r'/api/v1/borehole/profile/edit', ProfileProducerHandler),

        # Profile Layer handlers
        (r'/api/v1/borehole/profile/layer', ProfileLayerViewerHandler),
        (r'/api/v1/borehole/profile/layer/edit', ProfileProducerHandler),

        # Other handlers
        (r'/api/v1/borehole/codes', CodeListHandler),
        (r'/api/v1/geoapi/municipality', MunicipalityHandler),
        (r'/api/v1/geoapi/canton', CantonHandler),
        (r'/api/v1/geoapi/location', GeoapiHandler),
        (r"/api/v1/geoapi/wmts", Wmts),
        (r"/api/v1/geoapi/wms/swisstopo", Wms),

    ], **settings)

    # Check S3 configuration
    try:
        fileBase = FileBase()
        green("Connection to S3 (compatible) object storage: Ok")
    except S3Error as e:
        red("S3 Configuration error:\n{}".format(e))
        sys.exit(1)

    # Check for missing SMTP environment configuration options
    if (
        not options.smtp_sender or
        not options.smtp_server or
        not options.smtp_recipients
    ):
        raise Exception(
            "Missing mandatory SMTP environment configuration options (SMTP_SENDER|SMTP_SERVER|SMTP_RECIPIENTS)"
        )

    # Init database postgresql connection pool
    application.pool = ioloop.run_until_complete(get_conn())
    green("Connection to PostgreSQL database: Ok")

    # Create events listeners
    application.listener = EventListener(application)
    ioloop.run_until_complete(application.listener.start())

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
