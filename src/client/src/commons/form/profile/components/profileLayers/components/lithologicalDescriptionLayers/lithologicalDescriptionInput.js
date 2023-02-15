import React from "react";
import {
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Input,
  Stack,
  TextField,
} from "@mui/material";
import { useDomains } from "../../../../../../../api/fetchApiV2";
import { useTranslation } from "react-i18next";

const LithologicalDescriptionInput = props => {
  const {
    item,
    setFromDepth,
    setDescription,
    setToDepth,
    setQtDescriptionId,
    selectableToDepths,
    selectableFromDepths,
    lithologicalDescriptions,
  } = props;
  const { t, i18n } = useTranslation();
  const domains = useDomains();

  const closestTopLayer =
    lithologicalDescriptions[lithologicalDescriptions.indexOf(item) - 1];

  const closestBottomLayer =
    lithologicalDescriptions[lithologicalDescriptions.indexOf(item) + 1];

  const getFromDepthOptions = () => {
    // get all depths that are not yet in use and that are smaller than toDepth
    let options = selectableFromDepths.filter(
      d =>
        !lithologicalDescriptions.map(l => l.fromDepth).includes(d) &&
        d < item.toDepth,
    );
    // only allow selecting depths in the gap above the layer
    if (closestTopLayer !== undefined) {
      if (closestTopLayer.toDepth === item.fromDepth) {
        options = options.filter(d => d >= item.fromDepth);
      } else {
        options = options.filter(d => d >= closestTopLayer.fromDepth);
      }
    }
    // keep currently selected option
    options.push(item.fromDepth);
    return options.sort((a, b) => a - b);
  };

  const getToDepthOptions = () => {
    // get all depths that are not yet in use and that are greater than fromDepth
    let options = selectableToDepths.filter(
      d =>
        !lithologicalDescriptions.map(l => l.toDepth).includes(d) &&
        d > item.fromDepth,
    );
    // only allow selecting depths in the gap below the layer
    if (closestBottomLayer !== undefined) {
      if (closestBottomLayer.fromDepth === item.toDepth) {
        options = options.filter(d => d <= item.toDepth);
      } else {
        options = options.filter(d => d <= closestBottomLayer.toDepth);
      }
    }
    // keep currently selected option
    options.push(item.toDepth);
    return options.sort((a, b) => a - b);
  };

  const fromDepthOptions = getFromDepthOptions();
  const toDepthOptions = getToDepthOptions();

  return (
    <Stack direction="column" sx={{ width: "100%" }}>
      <FormControl variant="standard" sx={{ minWidth: 120 }} size="small">
        <InputLabel htmlFor="from-depth">{t("layer_depth_from")}</InputLabel>
        <Select
          disabled={fromDepthOptions.length === 1}
          data-cy="from-depth-select"
          defaultValue={item.fromDepth}
          input={<Input id="from-depth" />}
          onChange={e => {
            e.stopPropagation();
            setFromDepth(e.target.value);
          }}>
          {fromDepthOptions.map(d => (
            <MenuItem value={d}>{d}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        data-cy="description-textfield"
        label={t("description")}
        multiline
        rows={3}
        placeholder={t("description")}
        hiddenLabel
        defaultValue={item.description ?? ""}
        onChange={e => {
          setDescription(e.target.value);
        }}
        variant="standard"
        type="text"
        size="small"
        sx={{ overflow: "auto" }}
      />
      <FormControl variant="standard" sx={{ minWidth: 120 }} size="small">
        <InputLabel htmlFor="qt-description">{t("qt_description")}</InputLabel>
        <Select
          data-cy="qt-decription-select"
          defaultValue={item.qtDescriptionId}
          input={<Input id="qt-description" />}
          onChange={e => {
            e.stopPropagation();
            setQtDescriptionId(e.target.value);
          }}>
          <MenuItem value="">
            <em>{t("reset")}</em>
          </MenuItem>
          {domains?.data
            ?.filter(d => d.schema === "qt_description")
            .map(d => (
              <MenuItem value={d.id}>{d[i18n.language]}</MenuItem>
            ))}
        </Select>
      </FormControl>
      <FormControl variant="standard" sx={{ minWidth: 120 }} size="small">
        <InputLabel htmlFor="to-depth">{t("layer_depth_to")}</InputLabel>
        <Select
          disabled={toDepthOptions.length === 1}
          data-cy="to-depth-select"
          defaultValue={item.toDepth}
          input={<Input id="to-depth" />}
          onChange={e => {
            e.stopPropagation();
            setToDepth(e.target.value);
          }}>
          {toDepthOptions.map(d => (
            <MenuItem value={d}>{d}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
};
export default LithologicalDescriptionInput;
