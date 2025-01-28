import React from "react";
import { SxProps } from "@mui/material";
import { Workgroup } from "../../../../api-lib/ReduxStateInterfaces";

export interface ErrorResponse {
  detail: string;
  errors: object;
  message: string;
}

export interface WorkgroupSelectProps {
  workgroupId: number | null;
  enabledWorkgroups: Workgroup[];
  setWorkgroupId: React.Dispatch<React.SetStateAction<number | null>>;
  sx?: SxProps;
}

export interface NewBoreholeProps extends WorkgroupSelectProps {
  toggleDrawer: (open: boolean) => void;
}
