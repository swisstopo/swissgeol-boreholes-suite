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
    fromDepth,
    setFromDepth,
    description,
    setDescription,
    toDepth,
    setToDepth,
    qtDescriptionId,
    setQtDescriptionId,
    selectableToDepths,
    selectableFromDepths,
  } = props;
  const { t, i18n } = useTranslation();
  const domains = useDomains();

  return (
    <Stack direction="column" sx={{ width: "100%" }}>
      <FormControl variant="standard" sx={{ minWidth: 120 }} size="small">
        <InputLabel htmlFor="from-depth">{t("layer_depth_from")}</InputLabel>
        <Select
          data-cy="from-depth-select"
          defaultValue={fromDepth}
          input={<Input id="from-depth" />}
          onChange={e => {
            e.stopPropagation();
            setFromDepth(e.target.value);
          }}>
          <MenuItem value="">
            <em>{t("reset")}</em>
          </MenuItem>
          {selectableFromDepths.map(d => (
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
        value={description}
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
          defaultValue={qtDescriptionId}
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
          data-cy="to-depth-select"
          defaultValue={toDepth}
          input={<Input id="to-depth" />}
          onChange={e => {
            e.stopPropagation();
            setToDepth(e.target.value);
          }}>
          <MenuItem value="">
            <em>{t("reset")}</em>
          </MenuItem>
          {selectableToDepths
            ?.filter(d => d > fromDepth)
            .map(d => (
              <MenuItem value={d}>{d}</MenuItem>
            ))}
        </Select>
      </FormControl>
    </Stack>
  );
};
export default LithologicalDescriptionInput;
