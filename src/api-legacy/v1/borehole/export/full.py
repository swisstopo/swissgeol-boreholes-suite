# -*- coding: utf-8 -*-
from tornado.options import options
from bms import PUBLIC
from bms.v1.action import Action
from io import BytesIO
import zipfile
import json
from bms.v1.exceptions import NotFound
from bms.v1.borehole.export.spatialite import ExportSpatiaLite
from bms.v1.utils.files import DeleteFile, GetFile, SaveFile


class ZippedFullExport2Storage(Action):

    async def execute(self, id):

        # Fetch the event payload and the user id
        rec = await self.conn.fetchrow(
            """
                SELECT
                    payload_evs,
                    id_usr_fk,
                    to_char(
                        created_evs,
                        'YYYYMMDDHH24MISS'
                    ) as created_evs

                FROM
                    bdms.events

                WHERE
                    id_evs = $1

            """, id
        )

        # Convert to jsonb (string) to dict
        request = json.loads(rec[0])

        # Run the full export action
        zip_file = await (
            ZippedFullExport(self.conn)
        ).execute(request['workgroup'])

        # Publish the export in the file storage
        data = await (
            SaveFile(self.conn)
        ).execute(
            'export-%s.zip' % rec[2],
            'application/zip',
            zip_file,
            { "id": rec[1] }
        )

        # Delete all previous exports
        rows = await self.conn.fetch(
            """
                SELECT
                    id_evs,
                    id_usr_fk, 
                    topic_evs,
                    created_evs,
                    payload_evs

                FROM
                    bdms.events

                WHERE
                    topic_evs = 'DATABASE.EXPORT'
                AND
                    payload_evs @> '{"status": "done"}'::jsonb
            """
        )
        if rows:
            delete_file = DeleteFile(self.conn)
            for row in rows:
                pl = self.decode(row[4])

                try:
                    await delete_file.execute(pl['file'])

                except FileNotFoundError:
                    print(f"File not found: {pl['file']}")

                pl = {
                    "status": "archived"
                }

                await self.conn.execute(
                    """
                        UPDATE
                            bdms.events

                        SET
                            payload_evs = $1

                        WHERE
                            id_evs = $2
                    """,
                    self.encode(pl), row[0]
                )

        request.update({
            "status": "done",
            "file": data["id_fil"]
        })

        # Update the event status as done
        await self.conn.execute("""
            UPDATE
                bdms.events
            SET
                payload_evs = $1
            WHERE
                id_evs = $2
        """, json.dumps(request), id)

class ZippedFullExport(Action):

    async def execute(self, workgroup=None):

        # Init Action and execute it, 
        # to create the geopackage file
        geopackage_file = await (
            ExportSpatiaLite(self.conn)
        ).execute(workgroup)

        # Initialize the zip file
        output = BytesIO()
        zip_file = zipfile.ZipFile(
            output, mode="w", compression=zipfile.ZIP_DEFLATED
        )

        if geopackage_file:

            # Add the geopackage file to the zip file
            zip_file.writestr(
                'swissforages.gpkg', geopackage_file.getvalue()
            )

            # Prepare the SQL query to find the files related
            # to the workgroup that will be exported
            widx = 1
            where = []
            arguments = []

            if workgroup != 'all':

                widx = 1
                andId = []

                for id in workgroup:
                    andId.append(f"""
                        id_wgp_fk = ${widx}
                    """)
                    arguments.append(id)
                    widx += 1

                where.append(f"""(
                    {' OR '.join(andId)}
                )""")

            stringWhere = ''

            if len(where) > 0:
                stringWhere = f"""
                    WHERE
                        {' AND '.join(where)}
                """

            rows = await self.conn.fetch(f"""
                SELECT
                    name_fil,
                    type_fil,
                    conf_fil,
                    id_fil

                FROM
                    bdms.files

                INNER JOIN
                    bdms.borehole_files
                ON
                    id_fil_fk = id_fil
                    
                INNER JOIN
                    bdms.borehole
                ON
                    id_bho = id_bho_fk
                
                {stringWhere}
            """, *arguments)

            not_found = []

            # Initialize Save File Action
            get_file = GetFile(self.conn)

            # Loop all the file related to the request workgroups
            for file_info in rows:

                if file_info is None:
                    raise NotFound()

                # parse che conf (json) column to extract
                # the key name used in the s3 storage
                conf = json.loads(file_info[2])

                try:

                    f = await get_file.execute(file_info[3])

                    # Add the file to the zip file
                    zip_file.writestr(
                        f'files/{conf["key"]}', f['file'].getvalue()
                    )

                except FileNotFoundError:
                    not_found.append(conf['key'])

            if len(not_found) > 0:
                print(f"\033[91m{len(not_found)} files not found 🤔\033[0m")

        zip_file.close()
        return output
