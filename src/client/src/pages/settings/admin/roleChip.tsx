import { FC } from "react";
import { Chip, Stack } from "@mui/material";
import { Role } from "../../../api/generated";

interface RoleChipProps {
  role: Role;
}

export const RoleChip: FC<RoleChipProps> = ({ role }) => (
  <Stack direction="row" p={1.2}>
    <Chip label={role.toUpperCase()} size="small" color="primary" data-cy={`${role}-chip`} />
  </Stack>
);
