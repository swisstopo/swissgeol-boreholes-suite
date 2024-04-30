import TranslationText from "../../../form/translationText";
import { Box, MenuItem, Select, FormControl } from "@mui/material/";

const WorkgroupSelect = ({ setState, state }) => {
  return (
    <>
      <h3>
        <TranslationText firstUpperCase id="workgroup" />
      </h3>
      <Box
        style={{
          padding: "1em",
        }}>
        {(() => {
          const wg = state.enabledWorkgroups;
          const options = wg
            .filter(w => w.roles.indexOf("EDIT") >= 0)
            .map(wg => ({
              key: wg["id"],
              text: wg["workgroup"],
              value: wg["id"],
            }));
          if (wg.length === 0) {
            return <TranslationText id="disabled" />;
          } else if (wg.length === 1) {
            return wg[0].workgroup;
          }
          return (
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <Select
                renderValue={selected => {
                  return options.find(o => o.value === selected)?.text;
                }}
                onChange={e => {
                  setState({ workgroup: e.target.value });
                }}
                value={state.workgroup}>
                {options.map(o => (
                  <MenuItem key={o.id} value={o.value}>
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
