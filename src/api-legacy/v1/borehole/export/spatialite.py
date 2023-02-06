# -*- coding: utf-8 -*-
from tornado.options import options
from bms.v1.borehole.deletelist import DeleteBoreholesByWorkgroup
from bms import PUBLIC
from bms.v1.borehole.patch import PatchBorehole
from bms.v1.borehole.get import GetBorehole
from bms.v1.borehole.stratigraphy.get import GetStratigraphy
from bms.v1.action import Action
from bms.v1.borehole import CreateBorehole
from bms.v1.borehole.stratigraphy.layer.get import GetLayer
import traceback
import spatialite
import tempfile
from io import BytesIO
import zipfile
from minio import Minio
from minio.error import S3Error

from bms.v1.exceptions import ExportAlreadyRunning

# https://docs.python.org/2/library/sqlite3.html
# https://pypi.org/project/spatialite/

"""
Test this action from CLI:

python -m test.v1.borehole.export.spatialite

"""

class NotifyExportSpatialLiteAsync(Action):

    async def execute(self, user, workgroup=None):

        payload = {
            "workgroup": workgroup,
            "status": "running"
        }

        # Check if an EXPORT event is already running
        # and throw and exception if there is.
        row = await self.conn.fetchrow(
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
                    payload_evs @> '{"status": "running"}'::jsonb
            """
        )

        if row is not None:
            raise ExportAlreadyRunning()

        await self.notify(user, 'DATABASE.EXPORT', payload)

        return

class ExportSpatiaLite(Action):

    async def execute(self, workgroup=None, ids=None):

        # Creating a temporary file where the
        # SpatialLite DB will be populated
        spatia_lite_file = tempfile.NamedTemporaryFile(
            suffix='.gpkg',
            prefix='bdms_',
            # delete=False
        )

        try:
            with spatialite.connect(spatia_lite_file.name) as conn:

                cur = conn.cursor()

                # Time counsuming task. Is it necessary? Up to now, no.
                # conn.execute("SELECT load_extension('mod_spatialite')")
                conn.execute('SELECT gpkgCreateBaseTables()')
                conn.execute('SELECT EnableGpkgMode();')

                # Create the Borehole table
                cur.execute("""
                    CREATE TABLE boreholes (
                        id INTEGER NOT NULL PRIMARY KEY,
                        visible INTEGER,
                        update_date TEXT,
                        creation_date TEXT,
                        kind INTEGER,
                        restriction INTEGER,
                        restriction_until TEXT,
                        srs INTEGER,
                        qt_location INTEGER,
                        elevation_z REAL,
                        hrs INTEGER,
                        qt_elevation INTEGER,
                        reference_elevation REAL,
                        qt_reference_elevation INTEGER,
                        reference_elevation_type INTEGER,
                        drilling_date TEXT,
                        bore_inc REAL,
                        bore_inc_dir REAL,
                        length REAL,
                        extended_original_name TEXT,
                        extended_method INTEGER,
                        extended_purpose INTEGER,
                        extended_status INTEGER,
                        extended_top_bedrock REAL,
                        extended_groundwater INTEGER,
                        custom_project_name TEXT,
                        custom_alternate_name TEXT,
                        custom_canton INTEGER,
                        custom_city INTEGER,
                        custom_address TEXT,
                        custom_landuse INTEGER,

                        custom_cuttings INTEGER,
                        custom_drill_diameter INTEGER,
                        custom_qt_bore_inc_dir INTEGER,
                        custom_qt_length INTEGER,
                        custom_qt_top_bedrock INTEGER,
                        custom_lit_pet_top_bedrock INTEGER,
                        custom_lit_str_top_bedrock INTEGER,
                        custom_chro_str_top_bedrock INTEGER,
                        custom_remarks TEXT,

                        workflow_role TEXT
                    )
                """)

                cur.execute("""
                    INSERT INTO gpkg_contents (
                        table_name,
                        data_type,
                        identifier,
                        description,
                        last_change,
                        min_x,
                        min_y,
                        max_x,
                        max_y,
                        srs_id
                    ) values (
                        'boreholes',
                        'features',
                        'point_gpkg',
                        NULL,
                        '2021-01-01T00:00:00.000Z',
                        NULL,
                        NULL,
                        NULL,
                        NULL,
                        2056
                    );
                """)

                cur.execute("""
                    SELECT gpkgAddGeometryColumn(
                        'boreholes', 'the_geom', 'POINT', 0, 0, 2056
                    );
                """)

                cur.execute("""
                    select gpkgAddGeometryTriggers('boreholes','the_geom');
                """)

                cur.execute("""
                    select gpkgAddSpatialIndex('boreholes','the_geom');
                """)

                cur.execute("""
                    CREATE TABLE config (
                        name TEXT,
                        VALUE TEXT
                    )
                """)

                cur.execute("""
                    CREATE TABLE files (
                        id INTEGER NOT NULL PRIMARY KEY,
                        name TEXT,
                        description TEXT,
                        fhash TEXT,
                        ftype TEXT,
                        uploaded TEXT,
                        conf TEXT
                    )
                """)

                cur.execute("""
                    CREATE TABLE bfiles (
                        borehole INTEGER,
                        file INTEGER,
                        description TEXT,
                        public INTEGER,
                        attached TEXT,
                        updated TEXT
                    )
                """)

                cur.execute("""
                    CREATE TABLE stratigraphy (
                        id INTEGER NOT NULL PRIMARY KEY,
                        borehole INTEGER,
                        kind INTEGER,
                        is_primary INTEGER,
                        date TEXT,
                        update_date TEXT,
                        creation_date TEXT,
                        name TEXT
                    )
                """)

                cur.execute("""
                    CREATE TABLE layer (
                        id INTEGER NOT NULL PRIMARY KEY,
                        stratigraphy INTEGER,
                        creation_date TEXT,
                        update_date TEXT,
                        depth_from REAL,
                        depth_to REAL,
                        lithological_description TEXT,
                        facies_description TEXT,
                        is_last INTEGER,
                        qt_description INTEGER,
                        lithology INTEGER,
                        lithostratigraphy INTEGER,
                        chronostratigraphy INTEGER,
                        color TEXT,
                        plasticity INTEGER,
                        humidity INTEGER,
                        consistance INTEGER,
                        gradation INTEGER,
                        alteration INTEGER,
                        compactness INTEGER,
                        organic_component TEXT,
                        striae INTEGER,
                        grain_size_1 INTEGER,
                        grain_size_2 INTEGER,
                        grain_shape TEXT,
                        grain_granularity TEXT,
                        cohesion INTEGER,
                        uscs_1 INTEGER,
                        uscs_2 INTEGER,
                        uscs_3 INTEGER,
                        uscs_original INTEGER,
                        uscs_determination INTEGER,
                        debris TEXT,
                        lithology_top_bedrock INTEGER,
                        notes TEXT
                    )
                """)

                where = []
                arguments = []
                if workgroup:
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

                if ids:
                    widx = 1
                    andId = []
                    for id in ids:
                        andId.append(f"""
                            borehole.id_bho = ${widx}
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

                # Load all the boreholes
                boreholes = await self.conn.fetchval(f"""
                    SELECT
                        array_to_json(
                            array_agg(
                                row_to_json(t)
                            )
                        )
                    FROM (
                        {GetBorehole.get_sql()}
                        {stringWhere}
                        ORDER BY borehole.id_bho
                    ) AS t
                """, *arguments)

                boreholes = self.decode(boreholes) if boreholes is not None else []

                added_files = []

                for borehole in boreholes:

                    cur.execute(
                        """
                        INSERT INTO boreholes (
                            id, visible, update_date, creation_date,
                            kind,
                            restriction, restriction_until,
                            srs,
                            qt_location,
                            elevation_z,
                            hrs,
                            qt_elevation,
                            reference_elevation,
                            qt_reference_elevation,
                            reference_elevation_type,
                            drilling_date,
                            bore_inc,
                            bore_inc_dir,
                            length,

                            extended_original_name,
                            extended_method,
                            extended_purpose,
                            extended_status,
                            extended_top_bedrock,
                            extended_groundwater,

                            custom_project_name,
                            custom_alternate_name,
                            custom_canton,
                            custom_city,
                            custom_cuttings,
                            custom_drill_diameter,
                            custom_qt_bore_inc_dir,
                            custom_qt_length,
                            custom_qt_top_bedrock,
                            custom_lit_pet_top_bedrock,
                            custom_lit_str_top_bedrock,
                            custom_chro_str_top_bedrock,
                            custom_remarks,

                            workflow_role,

                            the_geom
                        ) VALUES (
                            ?, ?, ?, ?, ?, ?, ?, ?, ?,
                            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                            gpkgMakePoint(?, ?, 2056)
                        )
                        """, (
                        borehole['id'],
                        1 if borehole['visible'] == True else 0,
                        borehole['updater']['date'],
                        borehole['creator']['date'],
                        borehole['kind'],
                        borehole['restriction'],
                        (
                            borehole['restriction_until']
                            if borehole['restriction_until'] is not None
                            else 'NULL'
                        ),
                        borehole['srs'],

                        borehole['qt_location'],
                        borehole['elevation_z'],
                        borehole['hrs'],
                        borehole['qt_elevation'],
                        borehole['reference_elevation'],
                        borehole['qt_reference_elevation'],
                        borehole['reference_elevation_type'],
                        (
                            borehole['drilling_date']
                            if borehole['drilling_date'] is not None
                            else 'NULL'
                        ),
                        borehole['inclination'],
                        borehole['inclination_direction'],
                        borehole['total_depth'],
                        borehole['extended']['original_name'],
                        borehole['extended']['drilling_method'],
                        borehole['extended']['purpose'],
                        borehole['extended']['status'],
                        borehole['extended']['top_bedrock'],
                        1 if borehole['extended']['groundwater'] == True else 0,
                        borehole['custom']['project_name'],
                        borehole['custom']['alternate_name'],
                        borehole['custom']['canton'],
                        borehole['custom']['city'],

                        borehole['custom']['cuttings'],
                        borehole['custom']['drill_diameter'],
                        borehole['custom']['qt_bore_inc_dir'],
                        borehole['custom']['qt_depth'],
                        borehole['custom']['qt_top_bedrock'],
                        borehole['custom']['lithology_top_bedrock'],
                        borehole['custom']['lithostratigraphy_top_bedrock'],
                        borehole['custom']['chronostratigraphy_top_bedrock'],
                        borehole['custom']['remarks'],

                        borehole['workflow']['role'],

                        borehole['location_x'],
                        borehole['location_y'],
                        # "POINT({} {})".format(
                        #     borehole['location_x'],
                        #     borehole['location_y']
                        # )
                    ))

                    # Load all the required attachments
                    files = await self.conn.fetchval(f"""
                        SELECT
                            array_to_json(
                                array_agg(
                                    row_to_json(t)
                                )
                            )
                        FROM (
                            SELECT DISTINCT
                                id_fil AS id,
                                name_fil AS name,
                                type_fil AS type,
                                hash_fil AS hash,
                                COALESCE(description_bfi, '') AS description,
                                public_bfi AS public,
                                to_char(
                                    uploaded_fil,
                                    'YYYY-MM-DD"T"HH24:MI:SSOF'
                                ) as uploaded,
                                name_uuid_fil as nameUuid

                            FROM
                                bdms.files

                            INNER JOIN
                                bdms.borehole_files
                            ON
                                id_fil_fk = id_fil

                            WHERE
                                id_bho_fk = $1
                        ) AS t
                    """, borehole['id'])
                    files = self.decode(files) if files is not None else []

                    for fle in files:
                        if fle['id'] in added_files:
                            continue
                        added_files.append(fle['id'])
                        cur.execute(
                            """
                                INSERT INTO files (
                                    id,
                                    name,
                                    description,
                                    fhash,
                                    ftype,
                                    uploaded,
                                    nameUuid
                                ) VALUES (
                                    ?,?,?,?,?,?,?
                                )
                            """, (
                            fle['id'],
                            fle['name'],
                            fle['description'],
                            fle['hash'],
                            fle['type'],
                            fle['uploaded'],
                            fle['nameUuid']
                        ))

                    bfiles = await self.conn.fetchval(f"""
                        SELECT
                            array_to_json(
                                array_agg(
                                    row_to_json(t)
                                )
                            )
                        FROM (
                            SELECT
                                id_fil_fk AS id,
                                description_bfi AS description,
                                public_bfi AS public,
                                to_char(
                                    attached_bfi,
                                    'YYYY-MM-DD"T"HH24:MI:SSOF'
                                ) as attached,
                                to_char(
                                    update_bfi,
                                    'YYYY-MM-DD"T"HH24:MI:SSOF'
                                ) as updated

                            FROM
                                bdms.borehole_files

                            WHERE
                                id_bho_fk = $1
                        ) t
                    """, borehole['id'])

                    bfiles = self.decode(bfiles) if bfiles is not None else []

                    for bfile in bfiles:
                        cur.execute(
                            """
                                INSERT INTO bfiles (
                                    borehole,
                                    file,
                                    description,
                                    public,
                                    attached,
                                    updated
                                ) VALUES (
                                    ?,?,?,?,?,?
                                )
                            """, (
                            borehole['id'],
                            bfile['id'],
                            bfile['description'],
                            1 if bfile['public'] == True else 0,
                            bfile['attached'],
                            bfile['updated']
                        ))

                # Load all stratigraphies
                stratigraphies = await self.conn.fetchval(f"""
                    SELECT
                        array_to_json(
                            array_agg(
                                row_to_json(t)
                            )
                        )
                    FROM (
                        {GetStratigraphy.sql}
                        {stringWhere}
                    ) AS t
                """, *arguments)

                stratigraphies = self.decode(stratigraphies) if stratigraphies is not None else []

                for stratigraphy in stratigraphies:

                    cur.execute(
                        """
                            INSERT INTO stratigraphy (
                                id,
                                borehole,
                                kind,
                                is_primary,
                                date,
                                update_date,
                                creation_date,
                                name
                            ) VALUES (
                                ?,?,?,?,?,?,?,?
                            )
                        """, (
                        stratigraphy['id'],
                        stratigraphy['borehole']['id'],
                        stratigraphy['kind'],
                        1 if stratigraphy['primary'] == True else 0,
                        stratigraphy['date'],
                        stratigraphy['updated'],
                        stratigraphy['created'],
                        stratigraphy['name']
                    ))

                # Load all the layers
                layers = await self.conn.fetchval(f"""
                    SELECT
                        array_to_json(
                            array_agg(
                                row_to_json(t)
                            )
                        )
                    FROM (
                        {GetLayer.sql}
                        {stringWhere}
                    ) AS t
                """, *arguments)
                layers = self.decode(layers) if layers is not None else []

                for layer in layers:

                    cur.execute(
                        """
                            INSERT INTO layer (
                                id,
                                stratigraphy,
                                creation_date,
                                update_date,
                                depth_from,
                                depth_to,
                                lithological_description,
                                facies_description,
                                is_last,
                                qt_description,
                                lithology,
                                lithostratigraphy,
                                chronostratigraphy,
                                color,
                                plasticity,
                                humidity,
                                consistance,
                                alteration,
                                compactness,
                                organic_component,
                                striae,
                                grain_size_1,
                                grain_size_2,
                                grain_shape,
                                grain_granularity,
                                cohesion,
                                uscs_1,
                                uscs_2,
                                uscs_3,
                                uscs_original,
                                uscs_determination,
                                debris,
                                lithology_top_bedrock,
                                notes,
                                gradation
                            ) VALUES (
                                ?,?,?,?,?,?,?,?,?,
                                ?,?,?,?,?,?,?,?,?,
                                ?,?,?,?,?,?,?,?,?,
                                ?,?,?,?,?,?,?,?
                            )
                        """, (
                        layer['id'],
                        layer['stratigraphy'],
                        layer['creator']['date'],
                        layer['updater']['date'],
                        layer['depth_from'],
                        layer['depth_to'],
                        layer['lithological_description'],
                        layer['facies_description'],
                        1 if layer['last'] == True else 0,
                        layer['qt_description'],
                        layer['lithology'],
                        layer['lithostratigraphy'],
                        layer['chronostratigraphy'],
                        ",".join([str(elem) for elem in layer['color']]),
                        layer['plasticity'],
                        layer['humidity'],
                        layer['consistance'],
                        layer['alteration'],
                        layer['compactness'],
                        ",".join([str(elem) for elem in layer['organic_component']]),
                        layer['striae'],
                        layer['grain_size_1'],
                        layer['grain_size_2'],
                        ",".join([str(elem) for elem in layer['grain_shape']]),
                        ",".join([str(elem) for elem in layer['grain_granularity']]),
                        layer['cohesion'],
                        layer['uscs_1'],
                        layer['uscs_2'],
                        ",".join([str(elem) for elem in layer['uscs_3']]),
                        layer['uscs_original'],
                        layer['uscs_determination'],
                        ",".join([str(elem) for elem in layer['debris']]),
                        layer['lithology_top_bedrock'],
                        layer['notes'],
                        layer['gradation']
                    ))

                conn.commit()

            output = None

            with open(spatia_lite_file.name, 'rb') as fh:
                output = BytesIO(fh.read())

            spatia_lite_file.close()

            return output

        except Exception as ex:
            print(traceback.print_exc())
            spatia_lite_file.close()
            raise ex


class ImportSpatiaLite(Action):

    async def execute(self, user, workgroup_id, spatia_lite_file):

        result = {
            "files": {}
        }

        try:
            with spatialite.connect(spatia_lite_file) as conn:

                # Import files
                rows = conn.execute("""
                    SELECT
                        id, name, description,
                        fhash, ftype, uploaded, nameUuid
                    FROM
                        files
                """).fetchall()

                # files db importation
                for row in rows:
                    fid = row[0]
                    fname = row[1]
                    fhash = row[3]
                    ftype = row[4]
                    fnameUuid = row[6]

                    # check if a file with the same hash is already present
                    fil = await self.conn.fetchrow("""
                        SELECT
                            id_fil, id_usr_fk, hash_fil,
                            type_fil, uploaded_fil, name_uuid_fil
	                    FROM bdms.files
                        WHERE
                            hash_fil = $1
                    """, fhash)

                    # Flag if the file has been inserted
                    present = True

                    # # Insert reference in bdms db if not present
                    if fil is None:
                        present = False

                        id_fil = await self.conn.fetchval(
                            """
                                INSERT INTO bdms.files (
                                    name_fil, hash_fil,
                                    type_fil, name_uuid_fil,
                                    id_usr_fk
                                ) VALUES (
                                    $1, $2, $3, $4, $5
                                ) RETURNING id_fil
                            """,
                            fname,
                            fhash,
                            ftype,
                            fconf,
                            user['id']
                        )

                    else:
                        id_fil = fil[0]

                    result['files'][fhash] = {
                        "name": fname,
                        "hash": fhash,
                        "type": ftype,
                        "conf": self.decode(fconf),
                        "id": id_fil,
                        "present": present
                    }

                # << End of files db importation

                rows = conn.execute("""
                    SELECT
                        id, --0
                        visible, --1
                        kind, --2
                        restriction, --3
                        restriction_until, --4
                        qt_location, --5
                        elevation_z, --6
                        qt_elevation, --7
                        drilling_date, --8
                        bore_inc, --9
                        bore_inc_dir, --10
                        length, --11

                        extended_original_name, --12
                        extended_method, --13
                        extended_purpose, --14
                        extended_status, --15
                        extended_top_bedrock, --16
                        extended_groundwater, --17

                        custom_project_name, --18
                        custom_alternate_name, --19
                        custom_canton, --20
                        custom_city, --21
                        custom_address, --22
                        custom_landuse, --23
                        custom_cuttings, --24
                        custom_drill_diameter, --25
                        custom_qt_bore_inc_dir, --26
                        custom_qt_length, --27
                        custom_qt_top_bedrock, --28
                        custom_lit_pet_top_bedrock, --29
                        custom_lit_str_top_bedrock, --30
                        custom_chro_str_top_bedrock, --31
                        custom_remarks, --32

                        -- workflow_role,

                        ST_X(GeomFromGPB(the_geom)) as x, --33
                        ST_Y(GeomFromGPB(the_geom)) as y, --34

                        reference_elevation, --35
                        qt_reference_elevation, --36
                        reference_elevation_type --37

                    FROM
                        boreholes;
                """).fetchall()

                is_supplier = await self.conn.fetchval("""
                    SELECT
                        supplier_wgp
                    FROM
                        bdms.workgroups
                    WHERE
                        id_wgp = $1
                """, workgroup_id)

                # !! Removing all suppliers data
                if is_supplier is True:
                    await DeleteBoreholesByWorkgroup(
                        self.conn
                    ).execute(
                        workgroup_id
                    )

                for row in rows:

                    if is_supplier is True:
                        bid = await (
                            CreateBorehole(self.conn)
                        ).execute(
                            workgroup_id, user, PUBLIC, True
                        )

                    else:
                        bid = await (
                            CreateBorehole(self.conn)
                        ).execute(
                            workgroup_id, user
                        )

                    # Update all the fields at once
                    await self.conn.execute(f"""
                        UPDATE
                            bdms.borehole

                        SET
                            {PatchBorehole.get_column('visible')} = $1,
                            {PatchBorehole.get_column('kind')} = $2,
                            {PatchBorehole.get_column('restriction')} = $3,
                            {PatchBorehole.get_column(
                                'restriction_until'
                            )} = to_date($4, 'YYYY-MM-DD'),
                            {PatchBorehole.get_column('qt_location')} = $5,
                            {PatchBorehole.get_column('elevation_z')} = $6,
                            {PatchBorehole.get_column('qt_elevation')} = $7,
                            {PatchBorehole.get_column(
                                'drilling_date'
                            )} = to_date($8, 'YYYY-MM-DD'),
                            {PatchBorehole.get_column('inclination')} = $9,
                            {PatchBorehole.get_column('inclination_direction')} = $10,
                            {PatchBorehole.get_column('total_depth')} = $11,
                            {PatchBorehole.get_column('extended.original_name')} = $12,
                            {PatchBorehole.get_column('extended.drilling_method')} = $13,
                            {PatchBorehole.get_column('extended.purpose')} = $14,
                            {PatchBorehole.get_column('extended.status')} = $15,
                            {PatchBorehole.get_column('extended.top_bedrock')} = $16,
                            {PatchBorehole.get_column('extended.groundwater')} = $17,
                            {PatchBorehole.get_column('custom.project_name')} = $18,
                            {PatchBorehole.get_column('custom.alternate_name')} = $19,
                            {PatchBorehole.get_column('custom.canton')} = $20,
                            {PatchBorehole.get_column('custom.city')} = $21,
                            {PatchBorehole.get_column('custom.address')} = $22,
                            {PatchBorehole.get_column('custom.landuse')} = $23,
                            {PatchBorehole.get_column('custom.cuttings')} = $24,
                            {PatchBorehole.get_column('custom.drill_diameter')} = $25,
                            {PatchBorehole.get_column('custom.qt_bore_inc_dir')} = $26,
                            {PatchBorehole.get_column('custom.qt_depth')} = $27,
                            {PatchBorehole.get_column('custom.qt_top_bedrock')} = $28,
                            {PatchBorehole.get_column('custom.lithology_top_bedrock')} = $29,
                            {PatchBorehole.get_column('custom.lithostratigraphy_top_bedrock')} = $30,
                            {PatchBorehole.get_column('custom.chronostratigraphy_top_bedrock')} = $31,
                            {PatchBorehole.get_column('custom.remarks')} = $32,
                            geom_bho = {
                                'ST_GeomFromText($33, 2056)'
                                if row[33] and row[34]
                                else '$33'
                            },
                            {PatchBorehole.get_column('reference_elevation')} = $35,
                            {PatchBorehole.get_column('qt_reference_elevation')} = $36,
                            {PatchBorehole.get_column('reference_elevation_type')} = $37

                        WHERE
                            id_bho = $34

                    """,
                        True if row[1] == 1 else False,
                        row[2],
                        row[3],
                        row[4] if row[4] != 'NULL' else None,
                        row[5],
                        row[6],
                        row[7],
                        row[8] if row[8] != 'NULL' else None,
                        row[9],
                        row[10],
                        row[11],
                        row[12],
                        row[13],
                        row[14],
                        row[15],
                        row[16],
                        True if row[17] == 1 else False,
                        row[18],
                        row[19],
                        row[20],
                        row[21],
                        row[22],
                        row[23],
                        row[24],
                        row[25],
                        row[26],
                        row[27],
                        row[28],
                        row[29],
                        row[30],
                        row[31],
                        row[32],
                        f'POINT({row[33]} {row[34]})' if row[33] and row[34] else None,
                        bid['id'],
                        row[35],
                        row[36],
                        row[37]
                    )

                    # Insert borehole file attachments
                    bfiles = conn.execute("""
                        SELECT
                            files.fhash,
                            bfiles.file,
                            bfiles.description,
                            bfiles.public,
                            bfiles.attached,
                            bfiles.updated,
                            files.conf
                        FROM
                            bfiles

                        INNER JOIN
                            files
                        ON
                            files.id = bfiles.file

                        AND
                            borehole = ?
                    """, (
                        row[0],
                    )).fetchall()

                    for bfile in bfiles:
                        # Attach file to borehole
                        await self.conn.execute(
                            """
                                INSERT INTO bdms.borehole_files (
                                    id_bho_fk, id_fil_fk,
                                    id_usr_fk, updater_bfi,
                                    attached_bfi, update_bfi,
                                    description_bfi, public_bfi
                                ) VALUES (
                                    $1, (
                                        SELECT
                                            id_fil
                                        FROM
                                            bdms.files
                                        WHERE
                                            hash_fil = $2
                                    ), $3, $4,
                                    to_date($5, 'YYYY-MM-DD'),
                                    to_date($6, 'YYYY-MM-DD'),
                                    $7, $8
                                );
                            """,
                            bid['id'], bfile[0],
                            user['id'], user['id'],
                            bfile[4], bfile[5],
                            bfile[2],
                            True if bfile[3] == 1 else False,
                        )

                    strats = conn.execute("""
                        SELECT
                            id,
                            borehole,
                            is_primary,
                            name,
                            date,
                            update_date,
                            creation_date,
                            kind
                        FROM
                            stratigraphy
                        WHERE
                            borehole = ?
                    """, (
                        row[0],
                    )).fetchall()

                    # Insert all relative stratigraphies (of given borehole)
                    for strat in strats:
                        sty_id = await self.conn.fetchval("""
                            INSERT INTO bdms.stratigraphy(
                                id_bho_fk,
                                kind_id_cli,
                                primary_sty,
                                name_sty,
                                date_sty,
                                author_sty,
                                updater_sty,
                                update_sty,
                                creation_sty
                            )
                            VALUES (
                                $1, $10, $2, $3, $4,
                                to_date($5, 'YYYY-MM-DD'),
                                $6, $7,
                                to_date($8, 'YYYY-MM-DD'),
                                to_date($9, 'YYYY-MM-DD')
                            ) RETURNING id_sty
                        """,
                            bid['id'],
                            True if strat[2] == 1 else False,
                            strat[3],
                            strat[4],
                            user['id'],
                            user['id'],
                            strat[5] if strat[5] != 'NULL' else None,
                            strat[6] if strat[6] != 'NULL' else None,
                            strat[7]
                        )

                        layers = conn.execute("""
                            SELECT
                                id, --0
                                stratigraphy, --1
                                creation_date, --2
                                update_date, --3
                                depth_from, --4
                                depth_to, --5
                                lithological_description, --6
                                facies_description, --7
                                is_last, --8
                                qt_description, --9
                                lithology, -- 10
                                lithostratigraphy, --11
                                chronostratigraphy, --12
                                plasticity, --13
                                humidity, --14
                                consistance, --15
                                alteration, --16
                                compactness, --17
                                striae, --18
                                grain_size_1, --19
                                grain_size_2, --20
                                cohesion, --21
                                uscs_1, --22
                                uscs_2, --23
                                uscs_original, --24
                                notes, --25
                                color, --26
                                lithology_top_bedrock, --27
                                uscs_determination, --28
                                debris, --29
                                uscs_3, --30
                                grain_granularity, --31
                                grain_shape, --32
                                organic_component, --33
                                gradation -- 34

                            FROM
                                layer

                            WHERE
                                stratigraphy = ?
                        """, (
                            strat[0],
                        )).fetchall()

                        # Insert all relative layers (of given stratigraphy)
                        for layer in layers:
                            lay_id = await self.conn.fetchval(f"""
                                INSERT INTO bdms.layer(
                                    id_sty_fk,
                                    creator_lay, updater_lay,

                                    depth_from_lay, depth_to_lay,
                                    lithological_description_lay, facies_description_lay,

                                    last_lay, qt_description_id_cli,
                                    lithology_id_cli, lithostratigraphy_id_cli,

                                    chronostratigraphy_id_cli,
                                    plasticity_id_cli, humidity_id_cli,

                                    consistance_id_cli, alteration_id_cli,
                                    compactness_id_cli,

                                    striae_lay,
                                    grain_size_1_id_cli, grain_size_2_id_cli,

                                    cohesion_id_cli, uscs_1_id_cli, uscs_2_id_cli,
                                    uscs_original_lay,

                                    notes_lay,

                                    gradation_id_cli, uscs_3_id_cli,
                                    uscs_determination_id_cli,
                                    lithology_top_bedrock_id_cli
                                )
                                VALUES (
                                    $1,
                                    $3, $4,

                                    $5, $6,
                                    $7, $8,

                                    $9, $10,
                                    $11, $12,

                                    $13, $14,
                                    $15, $16,
                                    $17,
                                    $18, $19,
                                    $20, $21,
                                    $22, $23,
                                    $24, $25,
                                    $26, $27,

                                    $28, $29,
                                    $30

                                ) RETURNING id_lay
                            """,
                                sty_id, layer[0],
                                user['id'], user['id'],

                                layer[4], layer[5],
                                layer[6], layer[7],

                                True if layer[8] == 1 else False, layer[9],
                                layer[10], layer[11],

                                layer[12],
                                layer[13], layer[14],

                                layer[15], layer[16],
                                layer[17],

                                True if layer[18] == 1 else False,
                                layer[19], layer[20],

                                layer[21], layer[22], layer[23],
                                layer[24], layer[25],

                                layer[34], layer[30],
                                layer[28], layer[27]

                            )

                            # color
                            if layer[27]:

                                await self.conn.executemany("""
                                    INSERT INTO
                                        bdms.layer_codelist (
                                            id_lay_fk, id_cli_fk, code_cli
                                        ) VALUES ($1, $2, $3)
                                """, [
                                    (lay_id, int(v), 'mlpr112') for v in layer[26].split(',')]
                                )

                            # debris
                            if layer[33]:

                                await self.conn.executemany("""
                                    INSERT INTO
                                        bdms.layer_codelist (
                                            id_lay_fk, id_cli_fk, code_cli
                                        ) VALUES ($1, $2, $3)
                                """, [
                                    (
                                        lay_id, int(v), 'mcla107'
                                    ) for v in layer[30].split(',')]
                                )

                            # grain_granularity
                            if layer[35]:

                                await self.conn.executemany("""
                                    INSERT INTO
                                        bdms.layer_codelist (
                                            id_lay_fk, id_cli_fk, code_cli
                                        ) VALUES ($1, $2, $3)
                                """, [
                                    (
                                        lay_id, int(v), 'mlpr115'
                                    ) for v in layer[32].split(',')]
                                )

                            # grain_shape
                            if layer[36]:

                                await self.conn.executemany("""
                                    INSERT INTO
                                        bdms.layer_codelist (
                                            id_lay_fk, id_cli_fk, code_cli
                                        ) VALUES ($1, $2, $3)
                                """, [
                                    (
                                        lay_id, int(v), 'mlpr110'
                                    ) for v in layer[33].split(',')]
                                )
                            
                            # uscs_3
                            if layer[31]:

                                await self.conn.executemany("""
                                    INSERT INTO
                                        bdms.layer_codelist (
                                            id_lay_fk, id_cli_fk, code_cli
                                        ) VALUES ($1, $2, $3)
                                """, [
                                    (
                                        lay_id, int(v), 'mcla101'
                                    ) for v in layer[31].split(',')]
                                )

                            # organic_component
                            if layer[37]:

                                await self.conn.executemany("""
                                    INSERT INTO
                                        bdms.layer_codelist (
                                            id_lay_fk, id_cli_fk, code_cli
                                        ) VALUES ($1, $2, $3)
                                """, [
                                    (
                                        lay_id, int(v), 'mlpr108'
                                    ) for v in layer[34].split(',')]
                                )

            # await self.conn.execute("COMMIT;")

            # spatia_lite_file.close()

        except Exception as ex:
            # await self.conn.execute("ROLLBACK;")
            print(traceback.print_exc())
            # spatia_lite_file.close()

        return result
