import { ChangeEvent, FC } from "react";
import { useTranslation } from "react-i18next";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { Workgroup } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { capitalizeFirstLetter } from "../../../../utils.js";

interface WorkgroupFilterProps {
  selectedWorkgroup: string;
  onChange: (value: number | string) => void;
  workgroups: Workgroup[];
}
export const WorkgroupFilter: FC<WorkgroupFilterProps> = ({ selectedWorkgroup, onChange, workgroups }) => {
  const { t } = useTranslation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === "all") {
      onChange(event.target.value);
    } else {
      onChange(Number(event.target.value));
    }
  };

  return (
    <FormControl>
      <RadioGroup onChange={handleChange} value={selectedWorkgroup} defaultValue="all">
        <>
          <FormControlLabel
            key={"all"}
            value={"all"}
            control={<Radio data-cy="all" />}
            label={capitalizeFirstLetter(t("all"))}
          />
          {workgroups.map(workgroup => (
            <FormControlLabel
              key={workgroup.id}
              value={workgroup.id}
              control={<Radio data-cy={workgroup.workgroup} />}
              label={workgroup.workgroup + (workgroup.disabled !== null ? " ( " + t("disabled") + ")" : "")}
            />
          ))}
        </>
      </RadioGroup>
    </FormControl>
  );
};
