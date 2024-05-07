import { User } from "../../../form/borehole/segments/userInterface";
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
  refresh: () => void;
}

export interface MenuItemsProps {
  setState: React.Dispatch<React.SetStateAction<EditorSearchState>>;
  refresh: () => void;
  reset: () => void;
  boreholes: BoreholesData;
  user: User;
}

export interface BottomBarProps {
  toggleBottomDrawer: (open: boolean) => void;
  bottomDrawerOpen: boolean;
  boreholes: BoreholesData;
}
