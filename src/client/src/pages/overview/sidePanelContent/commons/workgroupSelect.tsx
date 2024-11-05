import { useTranslation } from "react-i18next";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material/";
import { styled } from "@mui/material/styles";
import { theme } from "../../../../AppTheme.ts";
import { WorkgroupSelectProps } from "./actionsInterfaces.ts";

const WorkgroupBox = styled(Box)({
  paddingTop: theme.spacing(2),
});

const WorkgroupSelect = ({ workgroupId, enabledWorkgroups, setWorkgroupId, sx, hideLabel }: WorkgroupSelectProps) => {
  const { t } = useTranslation();

  if (!enabledWorkgroups || enabledWorkgroups.length === 0) {
    return <WorkgroupBox>{t("disabled")}</WorkgroupBox>;
  }

  if (enabledWorkgroups.length === 1) {
    return <WorkgroupBox>{enabledWorkgroups[0].workgroup}</WorkgroupBox>;
  }

  const options = enabledWorkgroups
    .filter(w => w.roles.includes("EDIT"))
    .map(wg => ({
      key: wg.id,
      text: wg.workgroup,
      value: wg.id,
    }));

  return (
    <WorkgroupBox sx={{ backgroundColor: theme.palette.background.default, ...sx }}>
      <FormControl variant="outlined" sx={{ width: "100%" }}>
        {!hideLabel && <InputLabel id="workgroup-label">{t("workgroup")}</InputLabel>}
        <Select
          size="small"
          label={t("workgroup")}
          labelId="workgroup-label"
          data-cy="workgroup-formSelect"
          value={workgroupId}
          onChange={e => setWorkgroupId(e.target.value as string)}
          renderValue={selected => options.find(o => o.value === selected)?.text || ""}>
          {options.map(o => (
            <MenuItem key={o.key} value={o.value}>
              {o.text}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </WorkgroupBox>
  );
};
export default WorkgroupSelect;
