# -*- coding: utf-8 -*-
from ctypes import sizeof
from bms.v1.action import Action
from tornado.options import options
from minio import Minio
from minio.credentials import (
    StaticProvider,
    IamAwsProvider,
    AWSConfigProvider
)
from minio.error import S3Error
import traceback
import uuid
import hashlib
import json
from io import BytesIO

from bms.v1.exceptions import (
    NotFound
)

class FileBase(Action):

    def __init__(self, *arg, **args):
        super().__init__(*arg, **args)

        if options.file_repo != 's3':
            raise Exception('File repository not configured')

        if (
            options.s3_credentials_file is not None
            and options.s3_credentials_file != 'none'
        ):
            # Use local file with credentials
            print("Using local file with credentials")
            self.credentials = AWSConfigProvider(
                filename=options.s3_credentials_file,
                profile=options.s3_credentials_file_profile
            )

        elif options.s3_credentials_iam is True:
            # Use IAM provider
            print("Using IAM credentials")
            self.credentials = IamAwsProvider()

        else: # credentials access key, secret key
            print("Using access key, secret key")
            self.credentials = StaticProvider(
                options.s3_credentials_access_key,
                options.s3_credentials_secret_key,
                (
                    options.s3_credentials_session_token
                    if options.s3_credentials_session_token != 'none'
                    else None
                )
            )

        # Init S3 client
        self.s3 = Minio(
            options.s3_endpoint,
            credentials=self.credentials,
            region=(
                options.s3_region
                if options.s3_region != 'none'
                else None
            ),
            secure=options.s3_secure
        )

        # Check if bucket exists otherwise create a new one
        found = self.s3.bucket_exists(options.s3_bucket)
        if not found:
            self.s3.make_bucket(options.s3_bucket)

class S3Upload(FileBase):
    async def execute(self, file_name, content_type, file_body):
        try:
            length = file_body.getbuffer().nbytes
            file_body.seek(0)
            self.s3.put_object(
                options.s3_bucket,
                file_name,
                file_body,
                content_type=content_type,
                length=length,
                metadata={
                    'filename': file_name,
                }
            )

        except S3Error as exc:
            print(traceback.print_exc())
            raise Exception(
                "Error while uploading to S3 storage"
            )

class SaveFile(FileBase):

    async def execute(self, file_name, content_type, file_body, user, skip_insert=False):

        try:

            # Calculating hash
            m = hashlib.sha256()
            m.update(file_body.getvalue())
            file_hash = m.hexdigest()

            extension = None
            if file_name.find('.') > 0:
                extension = file_name.rsplit('.', 1)[1].lower()

            # Check for file duplication
            id_fil = await self.conn.fetchval(
                """
                    SELECT
                        id_fil
                    FROM
                        bdms.files
                    WHERE
                        hash_fil = $1
                """, file_hash
            )

            # Upload the file , if file not present
            if id_fil is None:

                file_name_uuid = "{}{}".format(
                    str(uuid.uuid1()),
                    f".{extension}" if extension is not None else ''
                )

                await (
                    S3Upload()
                ).execute(
                    file_name_uuid,
                    content_type,
                    file_body
                )

                # Insert info into database
                id_fil = await self.conn.fetchval(
                    """
                        INSERT INTO bdms.files (
                            name_fil, hash_fil,
                            type_fil, conf_fil,
                            id_usr_fk
                        ) VALUES (
                            $1, $2, $3, $4, $5
                        )
                        RETURNING id_fil;
                    """,
                    file_name,
                    file_hash,
                    content_type,
                    json.dumps({
                        'repo': 's3',
                        'key': file_name_uuid
                    }),
                    user['id']
                )

                return {
                    "id_fil": id_fil,
                    "key": file_name_uuid,
                }

        except Exception as ex:
            print(traceback.print_exc())
            raise ex


class GetFile(FileBase):

    async def execute(self, id):

        try:

            # Getting attachment info
            rec = await self.conn.fetchrow("""
                SELECT
                    name_fil,
                    type_fil,
                    conf_fil

                FROM
                    bdms.files

                WHERE
                    id_fil = $1
            """, id)

            if rec is None:
                raise NotFound()

            conf = json.loads(rec[2])

            info = {
                "contentType": rec[1],
                "name": rec[0],
                "conf": conf,
                "file": BytesIO() # Init the byteio object
            }

            # Download the file from s3
            data = self.s3.get_object(options.s3_bucket, conf['key'])

            # Write the data stream to the byteio object
            for d in data.stream(32*1024):
                # file.write(d)
                info['file'].write(d)

            return info
        
        except S3Error as ce:
            raise FileNotFoundError()

        except Exception as ex:
            print(traceback.print_exc())
            raise ex


class DeleteFile(FileBase):

    async def execute(self, id):

        try:
            # Getting attachment info
            rec = await self.conn.fetchrow("""
                SELECT
                    name_fil,
                    type_fil,
                    conf_fil

                FROM
                    bdms.files

                WHERE
                    id_fil = $1
            """, id)

            if rec is None:
                raise NotFound()

            conf = json.loads(rec[2])

            # Remove version of an object.
            self.s3.remove_object(
                options.s3_bucket, conf['key'],
            )

            await self.conn.execute("""
                DELETE FROM
                    bdms.files
                WHERE
                    id_fil = $1
            """, id)

        except S3Error as ce:
            raise FileNotFoundError()

        except Exception as ex:
            print(traceback.print_exc())
            raise ex
