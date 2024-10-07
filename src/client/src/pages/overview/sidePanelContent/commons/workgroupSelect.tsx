import { useTranslation } from "react-i18next";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material/";
import { theme } from "../../../../AppTheme.ts";
import { WorkgroupSelectProps } from "./actionsInterfaces.ts";

const WorkgroupSelect = ({ workgroupId, enabledWorkgroups, setWorkgroupId, sx }: WorkgroupSelectProps) => {
  const { t } = useTranslation();
  return (
    <>
      <Box sx={{ ...sx, backgroundColor: theme.palette.background.default }}>
        {(() => {
          const wg = enabledWorkgroups;
          if (wg === undefined) {
            return;
          }
          if (wg?.length === 0) {
            return t("disabled");
          } else if (wg?.length === 1) {
            return wg[0].workgroup;
          }
          const options = wg
            ?.filter(w => w.roles.indexOf("EDIT") >= 0)
            ?.map(wg => ({
              key: wg["id"],
              text: wg["workgroup"],
              value: wg["id"],
            }));
          return (
            <FormControl variant="outlined" sx={{ width: "100%" }}>
              <InputLabel id="workgroup-label">{t("workgroup")}</InputLabel>
              <Select
                size="small"
                label={t("workgroup")}
                labelId="workgroup-label"
                data-cy="workgroup-select"
                renderValue={selected => {
                  return options.find(o => o.value === selected)?.text;
                }}
                onChange={e => {
                  setWorkgroupId(e.target.value as number);
                }}
                value={workgroupId}>
                {options.map(o => (
                  <MenuItem key={o.key} value={o.value}>
                    {o.text}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        })()}
      </Box>
    </>
  );
};

export default WorkgroupSelect;
