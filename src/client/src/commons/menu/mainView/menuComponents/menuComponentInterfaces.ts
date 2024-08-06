import React from "react";
import { Workgroup } from "../../../../api-lib/ReduxStateInterfaces";
import { DrawerContentTypes } from "../../../../pages/editor/editorComponentInterfaces";

export interface BoreholeNumbersPreviewProps {
  isFetching: boolean;
  boreholeCount: number;
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
  reset: () => void;
}

export interface SideDrawerProps {
  drawerContent: React.JSX.Element;
  drawerOpen: boolean;
}

export interface BottomBarProps {
  toggleBottomDrawer: (open: boolean) => void;
  bottomDrawerOpen: boolean;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  downloadSelected: () => void;
  bulkEditSelected: () => void;
}

export interface MainSideNavProps {
  toggleDrawer: (open: boolean) => void;
  drawerOpen: boolean;
  workgroup: number | null;
  setWorkgroup: React.Dispatch<React.SetStateAction<number | null>>;
  enabledWorkgroups: Workgroup[];
  setEnabledWorkgroups: React.Dispatch<React.SetStateAction<Workgroup[]>>;
  setSideDrawerContent: React.Dispatch<React.SetStateAction<DrawerContentTypes>>;
  sideDrawerContent: DrawerContentTypes;
}
