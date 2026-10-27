import { FC } from "react";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { Role } from "../../../api/generated";
import { allRoles } from "./workgroupRoles.ts";

interface RoleSelectProps {
  value: Role;
  disabled: boolean;
  onChange: (role: Role) => void;
}

export const RoleSelect: FC<RoleSelectProps> = ({ value, disabled, onChange }) => {
  const handleChange = (event: SelectChangeEvent<Role>) => {
    const selectedRole = allRoles.find(option => option === event.target.value);
    if (selectedRole) onChange(selectedRole);
  };

  return (
    <Select<Role>
      value={value}
      size="small"
      disabled={disabled}
      onChange={handleChange}
      data-cy={`${value}-role-select`}
      sx={{ minWidth: 160 }}>
      {allRoles.map(option => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
  );
};
