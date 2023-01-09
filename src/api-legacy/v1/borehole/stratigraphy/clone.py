# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.borehole.stratigraphy.layer import ListLayers, CreateLayer


class CloneStratigraphy(Action):

    async def execute(self, id, user_id):

        id_sty = (
            await self.conn.fetchval(f"""
                INSERT INTO bdms.stratigraphy(
                    id_bho_fk,
                    date_sty,
                    updater_sty,
                    author_sty,
                    name_sty,
                    kind_id_cli
                )

                SELECT
                    id_bho_fk,
                    now(),
                    {user_id},
                    {user_id},
                    'Clone ' || name_sty,
                    kind_id_cli

                FROM
                    bdms.stratigraphy

                WHERE
                    id_sty = $1

                RETURNING
                    id_sty
            """, id)
        )

        # Copy stratigraphy_codelist
        await self.conn.execute(f"""
                INSERT INTO bdms.stratigraphy_codelist(
                    id_sty_fk,
                    id_cli_fk,
                    code_cli
                )

                SELECT
                    {id_sty} as id_sty_fk,
                    id_cli_fk,
                    code_cli

                FROM
                    bdms.stratigraphy_codelist

                WHERE
                    id_sty_fk = $1
        """, id)

        recs = await self.conn.fetch("""
            SELECT
                id_lay
            FROM
                bdms.layer
            WHERE
                id_sty_fk = $1
        """, id)

        for rec in recs:

            # Copy layers
            id_lay = await self.conn.fetchval(f"""
                INSERT INTO bdms.layer(
                    id_sty_fk,
                    depth_from_lay,
                    depth_to_lay,
                    undefined_lay,
                    lithological_description_lay,
                    facies_description_lay,
                    last_lay,
                    qt_description_id_cli,
                    lithology_id_cli,
                    chronostratigraphy_id_cli,
                    plasticity_id_cli,
                    consistance_id_cli,
                    gradation_id_cli,
                    alteration_id_cli,
                    compactness_id_cli,
                    grain_size_1_id_cli,
                    grain_size_2_id_cli,
                    cohesion_id_cli,
                    uscs_1_id_cli,
                    uscs_2_id_cli,
                    uscs_original_lay,
                    uscs_determination_id_cli,
                    notes_lay,
                    lithostratigraphy_id_cli,
                    humidity_id_cli,
                    striae_lay,
                    unconrocks_id_cli,
                    lithok_id_cli,
                    instr_kind_id_cli,
                    instr_status_id_cli,
                    instr_id_sty_fk,
                    casng_kind_id_cli,
                    casng_material_id_cli,
                    casng_inner_diameter_lay,
                    casng_outer_diameter_lay,
                    casng_date_spud_lay,
                    casng_date_finish_lay,
                    fill_material_id_cli,
                    creation_lay,
                    creator_lay,
                    update_lay,
                    updater_lay
                )

                SELECT
                    {id_sty} as id_sty_fk,
                    depth_from_lay,
                    depth_to_lay,
                    undefined_lay,
                    lithological_description_lay,
                    facies_description_lay,
                    last_lay,
                    qt_description_id_cli,
                    lithology_id_cli,
                    chronostratigraphy_id_cli,
                    plasticity_id_cli,
                    consistance_id_cli,
                    gradation_id_cli,
                    alteration_id_cli,
                    compactness_id_cli,
                    grain_size_1_id_cli,
                    grain_size_2_id_cli,
                    cohesion_id_cli,
                    uscs_1_id_cli,
                    uscs_2_id_cli,
                    uscs_original_lay,
                    uscs_determination_id_cli,
                    notes_lay,
                    lithostratigraphy_id_cli,
                    humidity_id_cli,
                    striae_lay,
                    unconrocks_id_cli,
                    lithok_id_cli,
                    instr_kind_id_cli,
                    instr_status_id_cli,
                    instr_id_sty_fk,
                    casng_kind_id_cli,
                    casng_material_id_cli,
                    casng_inner_diameter_lay,
                    casng_outer_diameter_lay,
                    casng_date_spud_lay,
                    casng_date_finish_lay,
                    fill_material_id_cli,
                    now(),
                    {user_id} as creator_lay,
                    now(),
                    {user_id} as updater_lay

                FROM
                    bdms.layer

                WHERE
                    id_lay = $1
                
                RETURNING
                    id_lay
            """, rec[0])

            # Copy stratigraphy_codelist
            await self.conn.execute(f"""
                    INSERT INTO bdms.layer_codelist(
                        id_lay_fk,
                        id_cli_fk,
                        code_cli
                    )

                    SELECT
                        {id_lay} as id_lay_fk,
                        id_cli_fk,
                        code_cli

                    FROM
                        bdms.layer_codelist

                    WHERE
                        id_lay_fk = $1
            """, rec[0])

        return {
            "id": id_sty
        }
