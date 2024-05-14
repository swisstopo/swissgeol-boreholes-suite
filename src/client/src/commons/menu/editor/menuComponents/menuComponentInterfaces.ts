import React from "react";

export interface BoreholesData {
  isFetching: boolean;
  dlen: number;
}

export interface BoreholeNumbersPreviewProps {
  boreholes: BoreholesData;
}

interface ErrorResponse {
  detail: string;
  errors: object;
  message: string;
}

export interface ImportErrorModalProps {
  errorResponse: ErrorResponse;
  setValidationErrorModal: React.Dispatch<React.SetStateAction<boolean>>;
  validationErrorModal: boolean;
}

export interface MenuItemsProps {
  refresh: () => void;
  reset: () => void;
  boreholes: BoreholesData;
}

export interface SideDrawerProps {
  drawerOpen: boolean;
  drawerWidth: number;
}

export interface BottomBarProps {
  toggleBottomDrawer: (open: boolean) => void;
  bottomDrawerOpen: boolean;
  boreholes: BoreholesData;
}
