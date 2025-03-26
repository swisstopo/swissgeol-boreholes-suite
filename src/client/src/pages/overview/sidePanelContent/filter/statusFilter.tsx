import { ChangeEvent, FC } from "react";
import { useTranslation } from "react-i18next";
import { FormControl } from "@mui/base";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { capitalizeFirstLetter } from "../../../../utils";

interface StatusFilterProps {
  selectedRole: string;
  setFilter: (key: string, value: string) => void;
}
export const StatusFilter: FC<StatusFilterProps> = ({ selectedRole, setFilter }) => {
  const { t } = useTranslation();

  const roles = [
    { name: "EDIT", translationKey: "statuseditor" },
    { name: "CONTROL", translationKey: "statuscontroller" },
    { name: "VALID", translationKey: "statusvalidator" },
    { name: "PUBLIC", translationKey: "statuspublisher" },
  ];

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFilter("role", event.target.value);
  };

  return (
    <FormControl>
      <RadioGroup onChange={handleChange} value={selectedRole} defaultValue="all">
        <>
          <FormControlLabel key={"all"} value={"all"} control={<Radio />} label={capitalizeFirstLetter(t("all"))} />
          {roles.map(role => (
            <FormControlLabel
              key={role.name}
              value={role.name}
              control={<Radio data-cy={role.translationKey} />}
              label={capitalizeFirstLetter(t(role.translationKey))}
            />
          ))}
        </>
      </RadioGroup>
    </FormControl>
  );
};
