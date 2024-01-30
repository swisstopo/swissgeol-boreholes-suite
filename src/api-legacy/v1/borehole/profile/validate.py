# -*- coding: utf-8 -*-
from bms.v1.action import Action


class ValidateProfile(Action):

    async def execute(self, profile, borehole, layers, user=None):

        validators = []

        result = {}

        if (
            profile["kind"] == 3000
            and borehole["extended"]["top_bedrock"] is not None
        ):
            validators.append(ValidateGeologyLayer(borehole))

        for idx in range(0, len(layers)):

            layer = layers[idx]

            depth_from = layer["depth_from"]
            depth_to = layer["depth_to"]

            validation = {}

            if idx == 0 and (depth_from is None or depth_from > 0):
                result["missingLayers"] = True

            for validator in validators:
                validator_validation, validator_result = await validator.execute(
                    layer, borehole, layers, idx
                )

                if validator_validation:
                    validation.update(validator_validation)

                if validator_result:
                    result.update(validator_result)
            
            # Is the last layer
            if borehole["total_depth"] is not None and idx == len(layers) - 1:
                if borehole["total_depth"] and layer["depth_to"] != borehole["total_depth"]:
                    result["wrongDepth"] = True

            if profile["kind"] == 3000:
                if depth_to is None:
                    validation["missingTo"] = True

                if depth_from is None:
                    validation["missingFrom"] = True

                if (
                    depth_from is not None
                    and depth_to is not None
                ):
                    if depth_from > depth_to:
                        validation["invertedDepth"] = True

                # Is not the first layer
                if idx > 0:
                    if (
                        depth_from is not None
                        and layers[idx - 1]["depth_to"] is not None
                    ):
                        if depth_from > layers[idx - 1]["depth_to"]:
                            validation["topDisjoint"] = True
                        elif depth_from < layers[idx - 1]["depth_to"]:
                            validation["topOverlap"] = True

                # Is not the last layer
                if idx < len(layers) - 1:
                    if (
                        depth_to is not None
                        and layers[(idx+1)]["depth_from"] is not None
                    ):
                        if depth_to < layers[(idx+1)]["depth_from"]:
                            validation["bottomDisjoint"] = True
                        elif depth_to > layers[(idx+1)]["depth_from"]:
                            validation["bottomOverlap"] = True

            # check if validation is not empty
            if validation:
                layer["validation"] = validation

        for validator in validators:
            result.update(validator.validation)

        # Get the list of  layers
        return {
            "validation": result,
            "data": layers
        }


class ValidateGeologyLayer(Action):

    def __init__(self, borehole, *arg, **args):
        super().__init__(*arg, **args)
        self.validation = {
            "missingBedrock": True
        }
        self.borehole = borehole

    async def execute(self, layer, borehole, layers, idx):

        result = {}
        validation = {}

        # Is the last layer
        # if idx == len(layers) - 1:
        #     if borehole["total_depth"] and layer["depth_to"] != borehole["total_depth"]:
        #         result["wrongDepth"] = True

        is_bedrock = (layer["depth_from"] ==
                      self.borehole["extended"]["top_bedrock"])
                      
        if is_bedrock is True:

            if "missingBedrock" in self.validation.keys():
                self.validation.pop("missingBedrock")

            if layer["description"] != self.borehole["custom"]["lithology_top_bedrock"]:
                validation["bedrockLitPetWrong"] = True

            if layer["title"] != self.borehole["custom"]["lithostratigraphy_top_bedrock"]:
                validation["bedrockLitStratiWrong"] = True

        return validation, result
