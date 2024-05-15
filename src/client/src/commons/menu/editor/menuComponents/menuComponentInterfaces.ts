import React from "react";
import { Boreholes } from "../../../../ReduxStateInterfaces";

export interface BoreholeNumbersPreviewProps {
  boreholes: Boreholes;
}

export interface ErrorResponse {
  detail: string;
  errors: object;
  message: string;
}

export interface ImportErrorModalProps {
  errorResponse: ErrorResponse | null;
  setValidationErrorModal: React.Dispatch<React.SetStateAction<boolean>>;
  validationErrorModal: boolean;
}

export interface MenuItemsProps {
  refresh: () => void;
  reset: () => void;
  boreholes: Boreholes;
}

export interface SideDrawerProps {
  drawerOpen: boolean;
  drawerWidth: number;
}

export interface BottomBarProps {
  toggleBottomDrawer: (open: boolean) => void;
  bottomDrawerOpen: boolean;
  boreholes: Boreholes;
}

export interface MainSideNavProps {
  toggleDrawer: (open: boolean) => void;
  drawerOpen: boolean;
}
