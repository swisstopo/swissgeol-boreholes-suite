import { useCallback, useContext, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Box, Card, FormControlLabel, Stack, Switch } from "@mui/material";
import { Trash2, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { DevTool } from "../../../../../../../hookformDevtools.js";
import { fetchLayerById, layerQueryKey, updateLayer } from "../../../../../../api/stratigraphy.ts";
import { CancelButton, SaveButton } from "../../../../../../components/buttons/buttons.js";
import { useCodelists } from "../../../../../../components/codelist.ts";
import { DataCardButtonContainer } from "../../../../../../components/dataCard/dataCard.tsx";
import { parseFloatWithThousandsSeparator } from "../../../../../../components/form/formUtils.ts";
import { PromptContext } from "../../../../../../components/prompt/promptContext.js";
import { useResetTabStatus } from "../../../../../../hooks/useResetTabStatus.ts";
import LithologyLayerForm from "./lithologyAttributeList/lithologyLayerForm.jsx";

const LithologyAttributes = ({ data, id, setSelectedLayer, setReloadLayer }) => {
  const { isEditable, onUpdated, layerAttributes, selectedStratigraphyID } = data;
  const [showAll, setShowAll] = useState(false);
  const [layer, setLayer] = useState(null);
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showPrompt } = useContext(PromptContext);
  const { data: codelists } = useCodelists();
  const resetTabStatus = useResetTabStatus(["lithology"]);

  const getDefaultValues = useCallback(
    layer => {
      if (!layer) return {};
      const attributesMap = {};
      layerAttributes.forEach(attribute => {
        if (attribute.type === "Boolean") {
          attributesMap[attribute.value] =
            layer[attribute.value] === true ? 1 : layer[attribute.value] === false ? 0 : 2;
        } else {
          attributesMap[attribute.value] = layer[attribute.value];
        }
      });
      return attributesMap;
    },
    [layerAttributes],
  );

  const formMethods = useForm({
    mode: "onChange",
    defaultValues: getDefaultValues(layer),
  });

  useEffect(() => {
    if (layer) {
      formMethods.reset(getDefaultValues(layer));
    }
  }, [layer, getDefaultValues, formMethods]);

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
    if (!id) return;
    fetchLayerById(id).then(mapResponseToLayer);
    setShowAll(false);
  }, [id, mapResponseToLayer]);

  const isFormDirty = formMethods.formState.isDirty;

  const onSave = () => {
    resetTabStatus();
    formMethods.handleSubmit(updateChange)();
    setSelectedLayer(null);
  };

  const onCancel = () => {
    if (isFormDirty) {
      showPrompt("messageDiscardUnsavedChanges", [
        {
          label: "cancel",
          icon: <X />,
          variant: "outlined",
        },
        {
          label: "discardchanges",
          icon: <Trash2 />,
          variant: "contained",
          action: () => {
            formMethods.reset(getDefaultValues(layer));
            setSelectedLayer(null);
          },
        },
      ]);
    }
  };

  function prepareFormDataForSubmit() {
    const updatedLayer = {
      ...layer,
      ...formMethods.getValues(),
    };
    layerAttributes.forEach(attribute => {
      if (attribute.type === "Boolean") {
        updatedLayer[attribute.value] =
          updatedLayer[attribute.value] === 1 ? true : updatedLayer[attribute.value] === 0 ? false : null;
      }
      if (attribute.type === "Dropdown" && !attribute.multiple) {
        updatedLayer[attribute.value] = updatedLayer[attribute.value] === "" ? null : updatedLayer[attribute.value];
      }
      if (attribute.isNumber) {
        updatedLayer[attribute.value] = parseFloatWithThousandsSeparator(updatedLayer?.[attribute.value]);
      }
    });
    updatedLayer.colorCodelistIds = updatedLayer.color;
    updatedLayer.debrisCodelistIds = updatedLayer.debris;
    updatedLayer.organicComponentCodelistIds = updatedLayer.organic_component;
    updatedLayer.grainAngularityCodelistIds = updatedLayer.grain_granularity;
    updatedLayer.grainShapeCodelistIds = updatedLayer.grain_shape;
    updatedLayer.uscs3CodelistIds = updatedLayer.uscs_3;
    return updatedLayer;
  }

  const updateChange = () => {
    const updatedLayer = prepareFormDataForSubmit();

    updateLayer(updatedLayer).then(response => {
      mapResponseToLayer(response);
      onUpdated(layerAttributes);
      queryClient.invalidateQueries({
        queryKey: [layerQueryKey, selectedStratigraphyID],
      });
      setReloadLayer(reloadLayer => reloadLayer + 1);
    });
  };

  const isVisibleFunction = field => {
    const layerKindDomain = codelists.find(d => d.schema === "layer_kind");
    if (layerKindDomain?.conf) {
      const configurationObject = JSON.parse(layerKindDomain.conf);
      return configurationObject?.fields?.[field] ?? false;
    }
    return false;
  };

  const showCheckbox = () => {
    let isVisibleCounter = 0;

    for (let i = 0; i < layerAttributes?.length; i++) {
      if (isVisibleFunction(layerAttributes[i]?.isVisibleValue)) {
        isVisibleCounter++;
      } else if (layerAttributes[i]?.isVisible) {
        isVisibleCounter++;
      }
    }

    if (isVisibleCounter === layerAttributes?.length) {
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
          {isEditable && (
            <DataCardButtonContainer>
              <SaveButton disabled={!isFormDirty} onClick={onSave} />
              <CancelButton disabled={!isFormDirty} onClick={onCancel} />
            </DataCardButtonContainer>
          )}
        </Stack>
        <Box sx={{ overflow: "auto", flex: 1, scrollbarGutter: "stable", pr: 1 }}>
          {layerAttributes && (
            <>
              <DevTool control={formMethods.control} placement="top-left" />
              <FormProvider {...formMethods} key={layer?.id || "initial"}>
                <LithologyLayerForm
                  attributes={layerAttributes}
                  showAll={showAll}
                  layer={layer}
                  isVisibleFunction={isVisibleFunction}
                  isEditable={isEditable}
                  formMethods={formMethods}
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
