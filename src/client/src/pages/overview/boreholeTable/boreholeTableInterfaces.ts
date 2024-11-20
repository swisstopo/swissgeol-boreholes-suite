import React from "react";
import {
  GridColumnHeaderParams,
  GridPaginationModel,
  GridRowSelectionModel,
  GridSortModel,
  GridValidRowModel,
} from "@mui/x-data-grid";
import { Boreholes } from "../../../api-lib/ReduxStateInterfaces.ts";

// export interface HeaderCheckboxParams extends GridColumnHeaderParams {
//   onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
// }

export interface HeaderCheckboxParams extends GridColumnHeaderParams<GridValidRowModel, any, any> {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface BoreholeTableProps {
  boreholes: Boreholes;
  paginationModel: GridPaginationModel;
  setPaginationModel: (model: GridPaginationModel) => void;
  selectionModel: GridRowSelectionModel;
  setSelectionModel: (model: GridRowSelectionModel) => void;
  sortModel: GridSortModel;
  setSortModel: (model: GridSortModel) => void;
  setHover: React.Dispatch<React.SetStateAction<number | null>>;
  rowToHighlight: number | null;
  isBusy: boolean;
}
