# -*- coding: utf-8 -*-
from bms.v1.action import Action
from bms.v1.exceptions import (
    PatchAttributeException
)


class PatchLayer(Action):

    @staticmethod
    def get_column(field):
        column = None

        if field == 'depth_from':
            column = 'depth_from_lay'

        elif field == 'depth_to':
            column = 'depth_to_lay'

        elif field == 'last':
            column = 'last_lay'

        elif field == 'qt_description':
            column = 'qt_description_id_cli'

        elif field == 'lithology':
            column = 'lithology_id_cli'

        elif field == 'lithostratigraphy':
            column = 'lithostratigraphy_id_cli'

        elif field == 'chronostratigraphy':
            column = 'chronostratigraphy_id_cli'

        elif field == 'plasticity':
            column = 'plasticity_id_cli'

        elif field == 'humidity':
            column = 'humidity_id_cli'

        elif field == 'consistance':
            column = 'consistance_id_cli'

        elif field == 'gradation':
            column = 'gradation_id_cli'

        elif field == 'alteration':
            column = 'alteration_id_cli'

        elif field == 'compactness':
            column = 'compactness_id_cli'

        elif field == 'lithology_top_bedrock':
            column = 'lithology_top_bedrock_id_cli'

        elif field == 'striae':
            column = 'striae_lay'

        elif field == 'grain_size_1':
            column = 'grain_size_1_id_cli'

        elif field == 'grain_size_2':
            column = 'grain_size_2_id_cli'

        elif field == 'restriction_until':
            column = 'restriction_until_lay'

        elif field == 'drilling_date':
            column = 'drilling_date_lay'

        elif field == 'cohesion':
            column = 'cohesion_id_cli'

        elif field == 'uscs_1':
            column = 'uscs_1_id_cli'

        elif field == 'uscs_2':
            column = 'uscs_2_id_cli'

        elif field == 'uscs_original':
            column = 'uscs_original_lay'

        elif field == 'original_lithology':
            column = 'original_lithology'

        elif field == 'uscs_determination':
            column = 'uscs_determination_id_cli'

        elif field == 'notes':
            column = 'notes_lay'

        elif field == 'instrument_status':
            column = 'instr_status_id_cli'

        elif field == 'instrument_kind':
            column = 'instr_kind_id_cli'

        elif field == 'instrument_casing_id':
            column = 'instr_id_sty_fk'

        elif field == 'instrument_id':
            column = 'instr_id'

        elif field == 'casing_id':
            column = 'casng_id'

        elif field == 'casing_kind':
            column = 'casng_kind_id_cli'

        elif field == 'casing_material':
            column = 'casng_material_id_cli'

        elif field == 'casing_inner_diameter':
            column = 'casng_inner_diameter_lay'

        elif field == 'casing_outer_diameter':
            column = 'casng_outer_diameter_lay'

        elif field == 'casing_date_spud':
            column = 'casng_date_spud_lay'

        elif field == 'casing_date_finish':
            column = 'casng_date_finish_lay'

        elif field == 'fill_material':
            column = 'fill_material_id_cli'

        elif field == 'fill_kind':
            column = 'fill_kind_id_cli'

        return column

    async def execute(self, id, field, value, user_id):
        try:
            # Updating character varing, boolean fields

            column = PatchLayer.get_column(field)

            if field in [
                'depth_from',
                'depth_to',
                'last',
                'striae',
                'uscs_original',
                'original_lithology',
                'notes',
                'instrument_id',
                'casing_inner_diameter',
                'casing_outer_diameter',
                'casing_id',
            ]:

                await self.conn.execute("""
                    UPDATE bdms.layer
                    SET
                        %s = $1,
                        update_lay = now(),
                        updater_lay = $2
                    WHERE id_lay = $3
                """ % column, value, user_id, id)

            # Datetime values
            elif field in [
                'restriction_until',
                'drilling_date',
                'casing_date_spud',
                'casing_date_finish'
            ]:

                await self.conn.execute("""
                    UPDATE bdms.layer
                    SET
                        %s = to_date($1, 'YYYY-MM-DD'),
                        update_lay = now(),
                        updater_lay = $2
                    WHERE id_lay = $3
                """ % column, value, user_id, id)

            elif field in [
                'qt_description',
                'lithology',
                'lithostratigraphy',
                'chronostratigraphy',
                'plasticity',
                'humidity',
                'consistance',
                'gradation',
                'alteration',
                'compactness',
                'grain_size_1',
                'grain_size_2',
                'cohesion',
                'uscs_1',
                'uscs_2',
                'uscs_determination',
                'lithology_top_bedrock',
                'casing_kind',
                'casing_material',
                'casing_drilling',
                'instrument_kind',
                'instrument_status',
                'fill_material',
                'fill_kind'
            ]:
                schema = field

                if field == 'lithology':
                    schema = 'custom.lithology_top_bedrock'

                elif field == 'lithostratigraphy':
                    schema = 'custom.lithostratigraphy_top_bedrock'

                elif field == 'chronostratigraphy':
                    schema = 'custom.chronostratigraphy_top_bedrock'

                elif field == 'plasticity':
                    schema = 'mlpr101'

                elif field == 'humidity':
                    schema = 'mlpr105'

                elif field == 'consistance':
                    schema = 'mlpr103'

                elif field == 'gradation':
                    schema = 'gradation'

                elif field == 'alteration':
                    schema = 'mlpr106'

                elif field == 'compactness':
                    schema = 'mlpr102'

                elif field == 'grain_size_1':
                    schema = 'mlpr109'

                elif field == 'grain_size_2':
                    schema = 'mlpr109'

                elif field == 'cohesion':
                    schema = 'mlpr116'

                elif field == 'uscs_1':
                    schema = 'mcla101'

                elif field == 'uscs_2':
                    schema = 'mcla101'

                elif field == 'uscs_determination':
                    schema = 'mcla104'

                elif field == 'instrument_kind':
                    schema = 'inst100'

                elif field == 'instrument_status':
                    schema = 'inst101'

                elif field == 'casing_kind':
                    schema = 'casi200'

                elif field == 'casing_material':
                    schema = 'casi201'

                elif field == 'casing_drilling':
                    schema = 'extended.method'

                elif field == 'fill_material':
                    schema = 'fill200'

                elif field == 'fill_kind':
                    schema = 'fill100'

                elif field == 'lithology_top_bedrock':
                    schema = 'custom.lithology_top_bedrock'

                # Check if domain is extracted from the correct schema
                if value is not None and schema != (
                    await self.conn.fetchval("""
                            SELECT
                                schema_cli
                            FROM
                                bdms.codelist
                            WHERE id_cli = $1
                        """, value
                    )
                ):
                    raise Exception(
                        "Attribute id %s not part of schema %s" % (
                            value, schema
                        )
                    )

                await self.conn.execute("""
                    UPDATE bdms.layer
                    SET
                        %s = $1,
                        update_lay = now(),
                        updater_lay = $2
                    WHERE id_lay = $3
                """ % column, value, user_id, id)

            elif field in ['instrument_casing_id']:

                if value is not None and value != 0:
                    # check if given id belong to this borehole
                    layer_borehole_id = await self.conn.fetchval(
                        """
                            SELECT
                                id_bho_fk
                            FROM
                                bdms.layer
                            INNER JOIN
                                bdms.stratigraphy
                            ON
                                layer.id_sty_fk = stratigraphy.id_sty
                            WHERE
                                id_lay = $1
                        """, id
                    )
                    casing_borehole_id = await self.conn.fetchval(
                        """
                            SELECT
                                id_bho_fk
                            FROM
                                bdms.stratigraphy
                            WHERE
                                id_sty = $1
                        """, value
                    )

                    if layer_borehole_id != casing_borehole_id:
                        raise Exception(
                            "Casing id %s not part of borehole %s" % (
                                value, layer_borehole_id
                            )
                        )

                await self.conn.execute("""
                    UPDATE bdms.layer
                    SET
                        %s = $1,
                        update_lay = now(),
                        updater_lay = $2
                    WHERE id_lay = $3
                """ % column, value, user_id, id)

            # Multiple fields
            elif field in [
                'color',
                'organic_component',
                'grain_shape',
                'grain_granularity',
                'uscs_3',
                # 'uscs_determination',
                'debris',
                # 'lithology_top_bedrock'
            ]:

                schema = field

                if field == 'color':
                    schema = 'mlpr112'

                elif field == 'organic_component':
                    schema = 'mlpr108'

                elif field == 'grain_shape':
                    schema = 'mlpr110'

                elif field == 'grain_granularity':
                    schema = 'mlpr115'

                elif field == 'uscs_3':
                    schema = 'mcla101'

                # elif field == 'uscs_determination':
                #     schema = 'mcla104'

                elif field == 'debris':
                    schema = 'mcla107'

                # elif field == 'lithology_top_bedrock':
                #     schema = 'custom.lithology_top_bedrock'

                await self.conn.execute("""
                    DELETE FROM bdms.layer_codelist
                    WHERE id_lay_fk = $1
                    AND code_cli = $2
                """, id, schema)

                if len(value) > 0:
                    # Check if domain(s) is(are) extracted from the
                    # correct schema
                    check = await self.conn.fetchval("""
                        SELECT COALESCE(count(schema_cli), 0) = $1
                        FROM (
                            SELECT
                                schema_cli
                            FROM
                                bdms.codelist
                            WHERE
                                id_cli = ANY($2)
                            AND
                                schema_cli = $3
                        ) AS c
                    """, len(value), value, schema)

                    if check is False:
                        raise Exception(
                            "One ore more attribute ids %s are "
                            "not part of schema attribute: %s" %
                            (
                                value, field
                            )
                        )

                    await self.conn.executemany("""
                        INSERT INTO
                            bdms.layer_codelist (
                                id_lay_fk, id_cli_fk, code_cli
                            ) VALUES ($1, $2, $3)
                    """, [(id, v, schema) for v in value])

                    await self.conn.execute("""
                        UPDATE bdms.layer
                        SET
                            update_lay = now(),
                            updater_lay = $1
                        WHERE id_lay = $2
                    """, user_id, id)

            else:
                raise PatchAttributeException(field)

        except PatchAttributeException as bmsx:
            raise bmsx

        except Exception:
            raise Exception("A server error occured while updating the layer")
