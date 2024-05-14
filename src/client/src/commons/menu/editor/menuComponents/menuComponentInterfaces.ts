import { EditorSearchState } from "../actions/actionsInterfaces";

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
  setState: React.Dispatch<React.SetStateAction<EditorSearchState>>;
  state: {
    errorResponse: ErrorResponse;
    validationErrorModal: boolean;
  };
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
