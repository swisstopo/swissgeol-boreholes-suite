import { deDE, enUS, frFR, itIT } from "@mui/x-data-grid/locales";
import { GridLocaleText } from "@mui/x-data-grid";

interface Dictionary<T> {
  [key: string]: T;
}

export const muiLocales: Dictionary<Partial<GridLocaleText>> = {
  de: deDE.components.MuiDataGrid.defaultProps.localeText,
  it: itIT.components.MuiDataGrid.defaultProps.localeText,
  fr: frFR.components.MuiDataGrid.defaultProps.localeText,
  en: enUS.components.MuiDataGrid.defaultProps.localeText,
};
