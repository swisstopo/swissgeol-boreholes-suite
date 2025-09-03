import { SxProps } from "@mui/material";

export interface ErrorResponse {
  detail: string;
  errors: object;
  message: string;
}

export interface WorkgroupSelectProps {
  sx?: SxProps;
}

export interface NewBoreholeProps extends WorkgroupSelectProps {
  toggleDrawer: (open: boolean) => void;
}
