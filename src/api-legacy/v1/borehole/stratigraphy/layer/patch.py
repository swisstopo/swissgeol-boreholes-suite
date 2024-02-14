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

        elif field == 'national_interest':
            column = 'national_interest'

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
                'lithology_top_bedrock'
            ]:
                schema = field

                if field == 'lithology':
                    schema = 'custom.lithology_top_bedrock'

                elif field == 'lithostratigraphy':
                    schema = 'custom.lithostratigraphy_top_bedrock'

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
                    schema = 'uscs_type'

                elif field == 'uscs_2':
                    schema = 'uscs_type'

                elif field == 'uscs_determination':
                    schema = 'uscs_determination'

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
                    schema = 'uscs_type'

                # elif field == 'uscs_determination':
                #     schema = 'uscs_determination'

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
