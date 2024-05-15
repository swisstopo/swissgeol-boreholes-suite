import TranslationText from "../../../form/translationText";
import { Box, FormControl, MenuItem, Select } from "@mui/material/";
import { WorkgroupSelectProps } from "./actionsInterfaces";

const WorkgroupSelect = ({ workgroup, enabledWorkgroups, setWorkgroup }: WorkgroupSelectProps) => {
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
            return <TranslationText id="disabled" />;
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
