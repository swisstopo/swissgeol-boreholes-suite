import { ChangeEvent, FC } from "react";
import { useTranslation } from "react-i18next";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { WorkflowStatus } from "@swissgeol/ui-core";
import { capitalizeFirstLetter } from "../../../../utils";
import { filterParsers } from "../../useBoreholeUrlParams.ts";

interface StatusFilterProps {
  selectedRole?: string;
  setFilterField: (key: keyof typeof filterParsers, value: unknown) => void;
}
export const StatusFilter: FC<StatusFilterProps> = ({ selectedRole, setFilterField }) => {
  const { t } = useTranslation();

  const workflowStatus = [
    WorkflowStatus.Draft,
    WorkflowStatus.InReview,
    WorkflowStatus.Reviewed,
    WorkflowStatus.Published,
  ];

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === "all") {
      setFilterField("workflowStatus", null);
    } else {
      setFilterField("workflowStatus", event.target.value);
    }
  };

  return (
    <FormControl>
      <RadioGroup onChange={handleChange} value={selectedRole} defaultValue="all">
        <>
          <FormControlLabel key={"all"} value={"all"} control={<Radio />} label={capitalizeFirstLetter(t("all"))} />
          {workflowStatus.map(status => (
            <FormControlLabel
              key={status}
              value={status}
              control={<Radio data-cy={status} />}
              label={capitalizeFirstLetter(t(`statuses.${status}`))}
            />
          ))}
        </>
      </RadioGroup>
    </FormControl>
  );
};
