import { SxProps } from "@mui/material";

export interface WorkgroupSelectProps {
  sx?: SxProps;
}

export interface NewBoreholeProps extends WorkgroupSelectProps {
  toggleDrawer: (open: boolean) => void;
}
