import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MenuItem, Stack, TextField } from "@mui/material";
import { useDomains } from "../../../../../../../api/fetchApiV2.ts";
import { formatNumberForDisplay } from "../../../../../../../components/form/formUtils.js";

const DescriptionInput = props => {
  const { item, setFromDepth, setDescription, setToDepth, setDescriptionQualityId, selectableDepths, descriptions } =
    props;
  const [fromDepthOptions, setFromDepthOptions] = useState();
  const [toDepthOptions, setToDepthOptions] = useState();

  const { t, i18n } = useTranslation();
  const domains = useDomains();

  const getFromDepthOptions = useCallback(() => {
    const closestTopLayer = descriptions[descriptions.indexOf(item) - 1];
    // get all depths that are not yet in use and that are smaller than toDepth
    let options = selectableDepths.filter(d => !descriptions.map(l => l.fromDepth).includes(d) && d < item.toDepth);
    // only allow selecting depths in the gap above the layer
    if (closestTopLayer !== undefined) {
      // and depths that are smaller than the bottom of the layer above
      options = options.filter(o => o >= closestTopLayer?.toDepth);
      if (closestTopLayer.toDepth === item.fromDepth) {
        options = options.filter(d => d >= item.fromDepth);
      } else {
        options = options.filter(d => d >= closestTopLayer.fromDepth);
      }
    }
    // keep currently selected option
    options.push(item.fromDepth);
    return options.sort((a, b) => a - b);
  }, [item, selectableDepths, descriptions]);

  const getToDepthOptions = useCallback(() => {
    const closestBottomLayer = descriptions[descriptions.indexOf(item) + 1];
    // get all depths that are not yet in use and that are greater than fromDepth
    let options = selectableDepths.filter(d => !descriptions.map(l => l.toDepth).includes(d) && d > item.fromDepth);
    // only allow selecting depths in the gap below the layer
    if (closestBottomLayer !== undefined) {
      // and greater than the top of the layer below
      options = options.filter(o => o <= closestBottomLayer?.fromDepth);
      if (closestBottomLayer.fromDepth === item.toDepth) {
        options = options.filter(d => d <= item.toDepth);
      } else {
        options = options.filter(d => d <= closestBottomLayer.toDepth);
      }
    }
    // keep currently selected option
    options.push(item.toDepth);
    return options.sort((a, b) => a - b);
  }, [item, selectableDepths, descriptions]);

  useEffect(() => {
    setFromDepthOptions(getFromDepthOptions());
    setToDepthOptions(getToDepthOptions());
  }, [getFromDepthOptions, getToDepthOptions]);

  // styled
  return (
    <Stack direction="column" sx={{ width: "100%" }}>
      <TextField
        select
        sx={{ flex: "1", margin: "10px" }}
        variant="outlined"
        size="small"
        label={t("fromdepth")}
        defaultValue={item.fromDepth}
        disabled={fromDepthOptions?.length === 1}
        data-cy="from-depth-select"
        InputLabelProps={{ shrink: true }}
        onChange={e => {
          e.stopPropagation();
          setFromDepth(e.target.value);
        }}>
        {fromDepthOptions?.map(d => (
          <MenuItem key={d.id} value={d}>
            {formatNumberForDisplay(d)}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        data-cy="description-textfield"
        label={t("description")}
        multiline
        rows={3}
        size="small"
        defaultValue={item.description ?? ""}
        onChange={e => {
          setDescription(e.target.value);
        }}
        variant="outlined"
        type="text"
        sx={{ flex: "1", margin: "10px" }}
      />
      <TextField
        select
        sx={{ flex: "1", margin: "10px" }}
        variant="outlined"
        size="small"
        label={t("description_quality")}
        defaultValue={item.descriptionQualityId ?? ""}
        data-cy="qt-decription-select"
        InputLabelProps={{ shrink: true }}
        onChange={e => {
          e.stopPropagation();
          setDescriptionQualityId(e.target.value);
        }}>
        <MenuItem value="">
          <em>{t("reset")}</em>
        </MenuItem>
        {domains?.data
          ?.filter(d => d.schema === "description_quality")
          .sort((a, b) => a.order - b.order)
          .map(d => (
            <MenuItem key={d.id} value={d.id}>
              {d[i18n.language]}
            </MenuItem>
          ))}
      </TextField>
      {toDepthOptions?.length > 0 && (
        <TextField
          select
          sx={{ flex: "1", margin: "10px" }}
          variant="outlined"
          size="small"
          label={t("todepth")}
          defaultValue={item.toDepth}
          disabled={toDepthOptions?.length === 1}
          data-cy="to-depth-select"
          InputLabelProps={{ shrink: true }}
          onChange={e => {
            e.stopPropagation();
            setToDepth(e.target.value);
          }}>
          {toDepthOptions?.map((d, index) => (
            <MenuItem key={index} value={d}>
              {formatNumberForDisplay(d)}
            </MenuItem>
          ))}
        </TextField>
      )}
    </Stack>
  );
};
export default DescriptionInput;
