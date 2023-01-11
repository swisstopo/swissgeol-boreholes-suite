# -*- coding: utf-8 -*-
import traceback
from bms import EDIT
from bms.v1.action import Action


class CopyBorehole(Action):

    async def execute(self, borehole, workgroup, user):

        try:
            await self.conn.execute("BEGIN;")

            bid = await self.conn.fetchval("""
                INSERT INTO bdms.borehole(
                    created_by_bho,
                    updated_by_bho,
                    id_wgp_fk,
                    public_bho,
                    kind_id_cli,
                    --location_x_bho,
                    --location_y_bho,
                    srs_id_cli,
                    --elevation_z_bho,
                    hrs_id_cli,
                    total_depth_bho,
                    date_bho,
                    restriction_id_cli,
                    restriction_until_bho,
                    original_name_bho,
                    alternate_name_bho,
                    qt_location_id_cli,
                    qt_elevation_id_cli,
                    reference_elevation,
                    qt_reference_elevation,
                    reference_elevation_type,
                    project_name_bho,
                    drilling_method_id_cli,
                    drilling_date_bho,
                    spud_date_bho,
                    cuttings_id_cli,
                    purpose_id_cli,
                    drilling_diameter_bho,
                    status_id_cli,
                    inclination_bho,
                    inclination_direction_bho,
                    qt_inclination_direction_id_cli,
                    qt_depth_id_cli,
                    top_bedrock_bho,
                    qt_top_bedrock_id_cli,
                    top_bedrock_tvd_bho,
                    qt_top_bedrock_tvd_id_cli,
                    groundwater_bho,
                    --geom_bho,
                    remarks_bho,
                    lithology_top_bedrock_id_cli,
                    lithostrat_id_cli,
                    chronostrat_id_cli,
                ) 
                SELECT
                    $1,
                    updated_by_bho,
                    $2,
                    public_bho,
                    kind_id_cli,
                    --location_x_bho,
                    --location_y_bho,
                    srs_id_cli,
                    --elevation_z_bho,
                    hrs_id_cli,
                    total_depth_bho,
                    date_bho,
                    restriction_id_cli,
                    restriction_until_bho,
                    original_name_bho,
                    alternate_name_bho,
                    qt_location_id_cli,
                    qt_elevation_id_cli,
                    reference_elevation,
                    qt_reference_elevation,
                    reference_elevation_type,
                    project_name_bho,
                    drilling_method_id_cli,
                    drilling_date_bho,
                    spud_date_bho,
                    cuttings_id_cli,
                    purpose_id_cli,
                    drilling_diameter_bho,
                    status_id_cli,
                    inclination_bho,
                    inclination_direction_bho,
                    qt_inclination_direction_id_cli,
                    qt_depth_id_cli,
                    top_bedrock_bho,
                    qt_top_bedrock_id_cli,
                    top_bedrock_tvd_bho,
                    qt_top_bedrock_tvd_id_cli,
                    groundwater_bho,
                    --geom_bho,
                    remarks_bho,
                    lithology_top_bedrock_id_cli,
                    lithostrat_id_cli,
                    chronostrat_id_cli,
                FROM
                    bdms.borehole

                WHERE
                    id_bho = $3

                RETURNING
                    id_bho

            """, user['id'], workgroup, borehole)

            await self.conn.execute("""
                INSERT INTO bdms.workflow(
                    id_bho_fk,
                    id_usr_fk,
                    id_rol_fk
                ) VALUES (
                    $1, $2, $3
                )
            """, bid, user['id'], EDIT)
        
            await self.conn.execute("""
                INSERT INTO bdms.borehole_codelist(
                    id_bho_fk, id_cli_fk, code_cli, value_bco
                )
                SELECT
                    $1, id_cli_fk, code_cli, value_bco
                FROM
                    bdms.borehole_codelist
                WHERE
                    id_bho_fk = $2
            """, bid, borehole)
        
            await self.conn.execute("""
                INSERT INTO bdms.borehole_files(
                    id_bho_fk, id_fil_fk, id_usr_fk,
                    updater_bfi, description_bfi, public_bfi
                )
                SELECT
                    $1, id_fil_fk, $2,
                    $3, description_bfi, public_bfi
                FROM
                    bdms.borehole_files
                WHERE
                    id_bho_fk = $4
            """, bid, user['id'], user['id'], borehole)

            # Fetch all stratigraphies associated with the borehole
            stratigraphies = await self.conn.fetch("""
                SELECT
                    id_sty, 
                FROM
                    bdms.stratigraphy
                WHERE
                    id_bho_fk = $1
            """, borehole)

            for stratigraphy in stratigraphies:

                # clone the single stratigraphy and store the new id
                sid = await self.conn.fetchval("""
                    INSERT INTO bdms.stratigraphy(
                        id_bho_fk, primary_sty, date_sty,
                        updater_sty, author_sty, name_sty
                    )
                    SELECT
                        $1, primary_sty, date_sty,
                        $2, $3, name_sty
                    FROM
                        bdms.stratigraphy
                    WHERE
                        id_sty = $4
                    RETURNING
                        id_sty
                """, bid, user['id'], user['id'], stratigraphy[0])

                # Fetch all layers associated with the stratigraphy
                layers = await self.conn.fetch("""
                    SELECT
                        id_lay
                    FROM
                        bdms.layer
                    WHERE
                        id_sty_fk = $1
                """, stratigraphy[0])

                for layer in layers:

                    # clone the single layer and store the new id
                    lid = await self.conn.fetchval("""
                        INSERT INTO bdms.layer(
                            creator_lay, updater_lay,
                            undefined_lay, id_sty_fk, depth_from_lay, depth_to_lay,
                            lithological_description_lay, facies_description_lay, last_lay,
                            qt_description_id_cli, lithology_top_bedrock_id_cli,
                            chronostratigraphy_id_cli,
                            plasticity_id_cli, consistance_id_cli,
                            alteration_id_cli, compactness_id_cli,
                            grain_size_1_id_cli,
                            grain_size_2_id_cli, cohesion_id_cli,
                            uscs_1_id_cli, uscs_2_id_cli, uscs_original_lay,
                            uscs_determination_id_cli, notes_lay,
                            lithostratigraphy_id_cli, humidity_id_cli, striae_lay,
                            gradation_id_cli
                        )
                        SELECT
                            $1, $2,
                            undefined_lay, $3, depth_from_lay, depth_to_lay,
                            lithological_description_lay, facies_description_lay, last_lay,
                            qt_description_id_cli, lithology_top_bedrock_id_cli,
                            chronostratigraphy_id_cli,
                            plasticity_id_cli, consistance_id_cli,
                            alteration_id_cli, compactness_id_cli,
                            grain_size_1_id_cli,
                            grain_size_2_id_cli, cohesion_id_cli,
                            uscs_1_id_cli, uscs_2_id_cli, uscs_original_lay,
                            uscs_determination_id_cli, notes_lay,
                            lithostratigraphy_id_cli, humidity_id_cli, striae_lay,
                            gradation_id_cli
                        FROM
                            bdms.layer
                        WHERE
                            id_lay = $4
                        RETURNING
                            id_lay
                    """, user['id'], user['id'], sid, layer[0])

        
                    await self.conn.execute("""
                        INSERT INTO bdms.layer_codelist(
                            id_lay_fk, id_cli_fk, code_cli
                        )
                        SELECT
                            $1, id_cli_fk, code_cli
                        FROM
                            bdms.layer_codelist
                        WHERE
                            id_lay_fk = $2
                    """, lid, layer[0])


            await self.conn.execute("COMMIT;")

            return {
                "id": bid
            }

        except Exception as ex:
            print(traceback.print_exc())
            await self.conn.execute("ROLLBACK;")
            raise ex
