# -*- coding: utf-8 -*-
from tornado.options import options
from bms.v1.exceptions import WrongParameter
from bms.v1.action import Action
from bms.v1.utils.files import S3Upload

from io import BytesIO
import zipfile
import traceback
import tempfile
import hashlib


class Importer(Action):
    
    async def execute(self, user, workgroup_id, archive):

        sfdb = 'swissforages.gpkg'

        # check if it is a zip file
        if not zipfile.is_zipfile(archive):
            raise WrongParameter("\"archive\". It is not a zip file.")

        try:
            with zipfile.ZipFile(archive) as myzip:
                
                swissforages = None
                try:
                    swissforages = myzip.getinfo(sfdb)
                except KeyError:
                    raise WrongParameter(
                        f"{sfdb}, not present"
                    )

                byts = myzip.read(swissforages)

                result = None
                with tempfile.NamedTemporaryFile() as spatia_lite_file:
                    imp = ImportSpatiaLite(self.conn)
                    spatia_lite_file.write(byts)
                    result = await imp.execute(user, workgroup_id, spatia_lite_file.name)

                # upload files to buckets
                infolist = myzip.infolist()
                if infolist:

                    s3Upload = S3Upload(self.conn)

                    for info in infolist:
                        if info.filename.startswith('files/'):

                            byts = myzip.read(info)
                            m = hashlib.sha256()
                            m.update(byts)
                            file_hash = m.hexdigest()

                            if (
                                file_hash in result['files'].keys()
                                and result['files'][file_hash]['present'] is False
                            ):
                                await s3Upload.execute(
                                    info.filename,
                                    result['files'][file_hash]["type"],
                                    BytesIO(byts)
                                )

        except Exception as ex:
            print(traceback.print_exc())
            raise ex

        return
