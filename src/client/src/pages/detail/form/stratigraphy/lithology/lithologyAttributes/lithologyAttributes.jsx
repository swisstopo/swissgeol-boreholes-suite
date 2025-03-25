import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import { Box, Card, FormControlLabel, Stack, Switch } from "@mui/material";
import _ from "lodash";
import { DevTool } from "../../../../../../../hookformDevtools.js";
import { fetchLayerById, layerQueryKey, updateLayer } from "../../../../../../api/fetchApiV2.js";
import { CancelButton, SaveButton } from "../../../../../../components/buttons/buttons.js";
import { DataCardButtonContainer } from "../../../../../../components/dataCard/dataCard.js";
import LithologyLayerForm from "./lithologyAttributeList/LithologyLayerForm.jsx";

const LithologyAttributes = props => {
  const { id, isEditable, checkLock, onUpdated, attribute, reloadAttribute, selectedStratigraphyID } = props.data;
  const formMethods = useForm();
  const { codes, geocode } = useSelector(state => ({
    codes: state.core_domain_list,
    geocode: "Geol",
  }));
  const [showAll, setShowAll] = useState(false);
  const [layer, setLayer] = useState(null);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const mapResponseToLayer = useCallback(response => {
    response["uscs_3"] = response.uscs3Codelists.map(x => x.id);
    response["grain_shape"] = response.grainShapeCodelists.map(x => x.id);
    response["grain_granularity"] = response.grainAngularityCodelists.map(x => x.id);
    response["organic_component"] = response.organicComponentCodelists.map(x => x.id);
    response["debris"] = response.debrisCodelists.map(x => x.id);
    response["color"] = response.colorCodelists.map(x => x.id);
    setLayer({ ...response });
  }, []);

  useEffect(() => {
    fetchLayerById(id).then(mapResponseToLayer);
    setShowAll(false);
  }, [mapResponseToLayer]);

  const onSave = () => {
    formMethods.handleSubmit(updateChange)();
  };

  const onCancel = () => {
    formMethods.reset();
  };

  const updateChange = () => {
    const updatedLayer = {
      ...layer,
      ...formMethods.getValues(),
    };

    updatedLayer.isStriae = updatedLayer?.isStriae === 1 ? true : updatedLayer?.isStriae === 0 ? false : null;
    updatedLayer.alterationId = updatedLayer.alteration === null ? null : updatedLayer.alterationId;
    updatedLayer.humidityId = updatedLayer.humidity === null ? null : updatedLayer.humidityId;
    updatedLayer.colorCodelistIds = updatedLayer.color;
    updatedLayer.debrisCodelistIds = updatedLayer.debris;
    updatedLayer.organicComponentCodelistIds = updatedLayer.organic_component;
    updatedLayer.grainAngularityCodelistIds = updatedLayer.grain_granularity;
    updatedLayer.grainShapeCodelistIds = updatedLayer.grain_shape;
    updatedLayer.uscs3CodelistIds = updatedLayer.uscs_3;

    updateLayer(updatedLayer).then(response => {
      mapResponseToLayer(response);
      onUpdated(attribute);
      queryClient.invalidateQueries({
        queryKey: [layerQueryKey, selectedStratigraphyID],
      });
    });
  };

  const isVisibleFunction = field => {
    if (_.has(codes, "data.layer_kind") && _.isArray(codes.data.layer_kind)) {
      for (let idx = 0; idx < codes.data.layer_kind.length; idx++) {
        const element = codes.data.layer_kind[idx];
        if (element.code === geocode) {
          if (_.isObject(element.conf) && _.has(element.conf, `fields.${field}`)) {
            return element.conf.fields[field];
          } else {
            return false;
          }
        }
      }
    }
    return false;
  };

  const showCheckbox = () => {
    let isVisibleCounter = 0;

    for (let i = 0; i < attribute?.length; i++) {
      if (isVisibleFunction(attribute[i]?.isVisibleValue)) {
        isVisibleCounter++;
      } else if (attribute[i]?.isVisible) {
        isVisibleCounter++;
      }
    }

    if (isVisibleCounter === attribute?.length) {
      return false;
    } else return true;
  };
  return (
    <Stack sx={{ backgroundColor: "lightgrey", height: "100%" }}>
      <Card sx={{ m: 2, p: 2, flex: 1, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" mb={2}>
          {showCheckbox() && (
            <FormControlLabel
              control={
                <Switch
                  data-cy={"show-all-fields-switch"}
                  color="secondary"
                  checked={showAll}
                  onChange={() => setShowAll(!showAll)}
                />
              }
              label={t("showallfields")}
            />
          )}
          <Box sx={{ flexGrow: 1 }} />
          <DataCardButtonContainer>
            <SaveButton onClick={onSave} />
            <CancelButton onClick={onCancel} />
          </DataCardButtonContainer>
        </Stack>
        <Box sx={{ overflow: "auto", flex: 1, scrollbarGutter: "stable" }}>
          {attribute && (
            <>
              <DevTool control={formMethods.control} placement="top-left" />
              <FormProvider {...formMethods}>
                <LithologyLayerForm
                  attribute={attribute}
                  showAll={showAll}
                  layer={layer}
                  isVisibleFunction={isVisibleFunction}
                  isEditable={isEditable}
                />
              </FormProvider>
            </>
          )}
        </Box>
      </Card>
    </Stack>
  );
};

export default LithologyAttributes;
