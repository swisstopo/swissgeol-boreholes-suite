# -*- coding: utf-8 -*-
from bms.v1.handlers import Viewer
from PyPDF2 import PdfFileWriter, PdfFileReader
from io import BytesIO
import zipfile
import traceback
from bms.v1.exceptions import (
    BmsException,
    AuthenticationException,
    ActionEmpty,
    MissingParameter
)
import json
import datetime
from .profile import bdms_pdf as bdms


class ExportHandler(Viewer):
    async def get(self, *args, **kwargs):
        try:

            if self.user is None:
                raise AuthenticationException()

            self.authorize()

            arguments = {}
            for key in self.request.query_arguments.keys():
                if self.request.query_arguments[key][0] != b'null':
                    if key == 'extent':
                        coords = self.get_argument(key).split(',')
                        for idx in range(0, len(coords)):
                            coords[idx] = float(coords[idx])

                        arguments[key] = coords
                    
                    elif key == 'format':
                        arguments[key] = self.get_argument(key).split(',')

                    elif key == 'lang':
                        arguments['language'] = self.get_argument(key)

                    else:
                        arguments[key] = self.get_argument(key)

            if 'format' not in arguments.keys():
                raise MissingParameter("format")

            now = datetime.datetime.now()

            self.set_header(
                "Expires",
                datetime.datetime.utcnow() +
                datetime.timedelta(seconds=1)
            )

            self.set_header(
                "Cache-Control",
                "max-age=" + str(1)
            )

            async with self.pool.acquire() as conn:

                output = None
                output_stream = None

                if 'pdf' in arguments['format']:

                    lan = arguments['language'] if 'language' in arguments else 'en'

                    if 'id' in arguments:

                        pdfs = []

                        for cid in arguments['id'].split(','):
                            cid = cid.split(':')
                            if len(cid)==2:
                                bid = int(cid[0])
                                sid = int(cid[1])

                                # TODO: test if passed sid belongs to passed bid
                                # else raise error
                            elif len(cid)==1:
                                bid = int(cid[0])

                                # Get primary stratigrafy
                                sid = await conn.fetchval("""
                                    SELECT
                                        id_sty
                                    FROM
                                        bdms.stratigraphy
                                    WHERE
                                        id_bho_fk = $1
                                    AND
                                        kind_id_cli = 3000
                                    AND
                                        primary_sty IS TRUE
                                """, bid)

                                # If there is no primary stratigrafy find the latest
                                if sid is None:
                                    sid = await conn.fetchval("""
                                        SELECT
                                            id_sty
                                        FROM
                                            bdms.stratigraphy
                                        WHERE
                                            id_bho_fk = $1
                                        ORDER BY
                                            date_sty DESC
                                        LIMIT 1;
                                    """, bid)

                            else:
                                raise ValueError("id parameters are {berehole id}:{stratigraphy id}")

                            if sid is not None:
                                fallback = 'en'
                                res = await conn.fetchval(f"""
                                    SELECT
                                        row_to_json(t2)
                                    FROM (
                                        SELECT
                                            id_bho as idb,
                                            country_bho as country,
                                            canton_bho as canton,
                                            municipality_bho as municipality,
                                            COALESCE(
                                                cli_kind.text_cli_{lan},
                                                cli_kind.text_cli_{fallback}
                                            ) as kind,
                                            location_x_bho as location_e,
                                            location_y_bho as location_n,
                                            COALESCE(elevation_z_bho, 0) as elevation_z,
                                            COALESCE(
                                                cli_srs.text_cli_{lan},
                                                cli_srs.text_cli_{fallback}
                                            ) as srs,
                                            -- cli_srs.text_cli_{lan} as srs,
                                            COALESCE(
                                                cli_hrs.text_cli_{lan},
                                                cli_hrs.text_cli_{fallback}
                                            ) as hrs,
                                            -- cli_hrs.text_cli_{lan} as hrs,
                                            total_depth_bho as total_depth,
                                            drilling_date_bho as drilling_date,
                                            spud_date_bho as spud_date,
                                            COALESCE(
                                                cli_restriction.text_cli_{lan},
                                                cli_restriction.text_cli_{fallback}
                                            ) as restriction,
                                            -- cli_restriction.text_cli_{lan} as restriction,
                                            to_char(
                                                restriction_until_bho,
                                                'YYYY-MM-DD'
                                            ) as restrictoin_until,
                                            COALESCE(
                                                cli_purpose.text_cli_{lan},
                                                cli_purpose.text_cli_{fallback}
                                            ) as purpose,
                                            -- cli_purpose.text_cli_{lan} as purpose,
                                            COALESCE(
                                                cli_cuttings.text_cli_{lan},
                                                cli_cuttings.text_cli_{fallback}
                                            ) as cuttings,
                                            -- cli_cuttings.text_cli_{lan} as cuttings,
                                            COALESCE(
                                                cli_method.text_cli_{lan},
                                                cli_method.text_cli_{fallback}
                                            ) as method,
                                            -- cli_method.text_cli_{lan} as drilling_method,
                                            COALESCE(
                                                cli_status.text_cli_{lan},
                                                cli_status.text_cli_{fallback}
                                            ) as status,
                                            -- cli_status.text_cli_{lan} as status,
                                            drilling_diameter_bho as drill_diameter,
                                            inclination_bho as inclination,
                                            inclination_direction_bho as inclination_direction,
                                            project_name_bho as project_name,
                                            '12345' as auth_n,
                                            original_name_bho as original_name,
                                            alternate_name_bho as alternate_name,
                                            strat_j.name_sty as strataname,
                                            strat_j.date_sty as stratadate,
                                            'IFEC' as logged_by,
                                            'swisstopo' as checked_by,
                                            groundwater_bho as groundwater,

                                            (
                                                SELECT array_to_json(
                                                    array_agg(
                                                        row_to_json(t)
                                                    )
                                                )
                                                FROM (
                                                    SELECT
                                                        value_bco as value,
                                                        COALESCE(
                                                            text_cli_{lan},
                                                            text_cli_en
                                                        ) as identifier
                                                    FROM
                                                        bdms.borehole_codelist
                                                    INNER JOIN
                                                        bdms.codelist
                                                    ON
                                                        id_cli_fk = id_cli
                                                    WHERE
                                                        borehole_codelist.code_cli = 'borehole_identifier'
                                                    AND
                                                        borehole_codelist.id_bho_fk = $1

                                                ) AS t
                                            ) AS identifiers,

                                            (
                                                SELECT array_to_json(
                                                    array_agg(
                                                        row_to_json(t)
                                                    )
                                                )
                                                FROM (
                                                    SELECT
                                                        id_lay as id,
                                                        id_sty as id_sty,
                                                        depth_from_lay as depth_from,
                                                        depth_to_lay as depth_to,
                                                        CASE
                                                            WHEN elevation_z_bho is NULL 
                                                            THEN 0 - depth_from_lay
                                                            ELSE elevation_z_bho - depth_from_lay
                                                        END AS msm_from,
                                                        CASE
                                                            WHEN elevation_z_bho is NULL 
                                                            THEN 0 - depth_to_lay
                                                            ELSE elevation_z_bho - depth_to_lay
                                                        END AS msm_to,
                                                        COALESCE(
                                                            cli_lithostra.text_cli_{lan},
                                                            cli_lithostra.text_cli_{fallback}
                                                        ) as lithostratigraphy,
                                                        -- cli_lithostra.text_cli_{lan} as lithostratigraphy,
                                                        cli_lithostra.conf_cli as conf_lithostra,
                                                        cli_lithostra.geolcode as geolcode_lithostra,
                                                        COALESCE(
                                                            cli_lithology.text_cli_{lan},
                                                            cli_lithology.text_cli_{fallback}
                                                        ) as lithology,
                                                        -- cli_lithology.text_cli_{lan} as lithology,
                                                        cli_lithology.conf_cli as conf_lithology,
                                                        name_sty as name_st,
                                                        notes_lay as notes
                                                    FROM
                                                        bdms.layer
                                                    LEFT JOIN bdms.codelist as cli_lithostra
                                                        ON cli_lithostra.id_cli = lithostratigraphy_id_cli
                                                    LEFT JOIN bdms.codelist as cli_lithology
                                                        ON cli_lithology.id_cli = lithology_top_bedrock_id_cli
                                                    INNER JOIN bdms.stratigraphy
                                                        ON id_sty_fk = id_sty
                                                    INNER JOIN bdms.borehole
                                                        ON id_bho_fk = id_bho
                                                    WHERE
                                                        id_sty = $2
                                                    AND
                                                        id_bho = strat_j.id_bho_fk
                                                    ORDER BY depth_from_lay, id_lay

                                                ) AS t
                                            ) AS layers 
                                        FROM 
                                            bdms.borehole
                                        LEFT JOIN bdms.codelist as cli_kind
                                            ON cli_kind.id_cli = kind_id_cli
                                        LEFT JOIN bdms.codelist as cli_srs
                                            ON cli_srs.id_cli = srs_id_cli
                                        LEFT JOIN bdms.codelist as cli_hrs
                                            ON cli_hrs.id_cli = hrs_id_cli
                                        LEFT JOIN bdms.codelist as cli_restriction
                                            ON cli_restriction.id_cli = restriction_id_cli
                                        LEFT JOIN bdms.codelist as cli_purpose
                                            ON cli_purpose.id_cli = purpose_id_cli
                                        LEFT JOIN bdms.codelist as cli_method
                                            ON cli_method.id_cli = drilling_method_id_cli
                                        LEFT JOIN bdms.codelist as cli_status
                                            ON cli_status.id_cli =status_id_cli
                                        LEFT JOIN bdms.codelist as cli_cuttings
                                            ON cli_cuttings.id_cli = cuttings_id_cli

                                        LEFT JOIN (
                                            SELECT id_sty, date_sty, name_sty, id_bho_fk 
                                            FROM bdms.stratigraphy
                                            --WHERE primary_sty = true
                                        ) as strat_j
                                        ON strat_j.id_sty = $3
                                                
                                        WHERE
                                            id_bho = id_bho_fk
                                        AND
                                            strat_j.id_sty = $4
                                    ) AS t2
                                """, bid, sid, sid, sid)

                                d = json.loads(res)

                                a = bdms.bdmsPdf(d)
                                a.renderProfilePDF(
                                    arguments['lang'] if 'lang' in arguments else 'en',
                                    int(arguments['scale']) if 'scale' in arguments else 200
                                )
                                a.close()

                                pdfs.append(a.pdf)

                    def append_pdf(input, output):
                        [
                            output.addPage(
                                input.getPage(page_num)
                            ) for page_num in range(input.numPages)
                        ]

                    outputFW = PdfFileWriter()
                    for pdf in pdfs:
                        inpt = PdfFileReader(pdf)
                        if inpt.isEncrypted:
                            inpt.decrypt('')
                        append_pdf(inpt, outputFW)

                    working_file = BytesIO()
                    outputFW.write(working_file)

                    if output_stream is not None:
                        output_stream.writestr(
                            'export-%s.pdf' % now.strftime(
                                    "%Y%m%d%H%M%S"
                            ),
                            working_file.getvalue()
                        )

                    else:
                        self.set_header(
                            "Content-Type",
                            "application/pdf"
                        )
                        self.set_header(
                            "Content-Disposition",
                            "inline; filename=export-%s.pdf" % now.strftime(
                                    "%Y%m%d%H%M%S"
                            )
                        )
                        self.write(working_file.getvalue())

            if output_stream is not None:
                output_stream.close()
                self.write(output.getvalue())

        except BmsException as bex:
            print(traceback.print_exc())
            self.write({
                "success": False,
                "message": str(bex),
                "error": bex.code
            })

        except Exception as ex:
            print(traceback.print_exc())
            self.write({
                "success": False,
                "message": str(ex)
            })

        self.finish()
