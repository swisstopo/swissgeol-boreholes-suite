import { Box, FormControl, MenuItem, Select } from "@mui/material/";
import { WorkgroupSelectProps } from "./actionsInterfaces.ts";
import { useTranslation } from "react-i18next";

const WorkgroupSelect = ({ workgroup, enabledWorkgroups, setWorkgroup }: WorkgroupSelectProps) => {
  const { t } = useTranslation();
  return (
    <>
      <Box
        style={{
          padding: "1em",
        }}>
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
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <Select
                type="number"
                renderValue={selected => {
                  return options.find(o => o.value === selected)?.text;
                }}
                onChange={e => {
                  setWorkgroup(e.target.value as number);
                }}
                value={workgroup}>
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
