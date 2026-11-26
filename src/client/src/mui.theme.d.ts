import { Typography } from "@mui/material";
import { Theme, ThemeOptions } from "@mui/material/styles";
import { TypographyOptions } from "@mui/material/styles/createTypography";
import { Breakpoints } from "@mui/system";
import { BreakpointsOptions } from "@mui/system/createTheme/createBreakpoints";

declare module "@mui/material/IconButton" {
  interface IconButtonPropsColorOverrides {
    primaryInverse: true;
    ai: true;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    fullPageMessage: true;
  }
}

declare module "@mui/material/styles" {
  export type MapSymbolColorName =
    | "purple"
    | "yellow"
    | "red"
    | "orange"
    | "pink"
    | "grey"
    | "lightGrey"
    | "magenta1"
    | "magenta2"
    | "magenta3"
    | "violet1"
    | "violet2"
    | "violet3"
    | "violet4"
    | "violet5"
    | "crimson1"
    | "crimson2"
    | "crimson3"
    | "crimson4"
    | "amber1"
    | "amber2"
    | "amber3"
    | "brown1"
    | "brown2"
    | "brown3"
    | "brown4"
    | "ochre"
    | "depth1"
    | "depth2"
    | "depth3"
    | "depth4"
    | "depth5"
    | "depth6"
    | "depth7"
    | "depth8";

  export interface MapSymbolColor {
    fill: string;
    stroke: string;
    shadow: string;
  }

  export interface AppThemePalette {
    action: {
      disabled: string;
    };
    primary: {
      main: string;
      contrastText: string;
      muted: string;
      background: string;
    };
    secondary: {
      main: string;
      contrastText: string;
      background: string;
    };
    tertiary: {
      main: string;
    };
    success: {
      main: string;
    };
    info: {
      main: string;
    };
    warning: {
      main: string;
      background: string;
      backgroundHover: string;
    };
    error: {
      main: string;
      dark: string;
      light: string;
      contrastText: string;
      background: string;
      backgroundHover: string;
    };
    neutral: {
      main: string;
      contrastText: string;
    };
    hover: {
      main: string;
    };
    mapIcon: {
      main: string;
      secondary: string;
      selected: string;
    };
    map: {
      symbol: Record<MapSymbolColorName, MapSymbolColor>;
      symbolHalo: string;
      hover: string;
      active: string;
      popoverValueText: string;
      legendSegmentText: string;
      legendSegmentShadow: string;
      drawFill: string;
      drawStroke: string;
      clusterStroke: string;
      clusterFill: string;
      clusterText: string;
      detailSelectedFill: string;
      detailUnselectedFill: string;
    };
    ai: {
      background: string;
      header: string;
      main: string;
      mainTransparent: string;
      textHighlights: string;
      mainEnd: string;
      active: string;
      activeEnd: string;
      contrastText: string;
      secondary: string;
      secondaryTextHighlights: string;
      highlightBackground: string;
      highlightBorder: string;
    };
    border: {
      light: string;
      darker: string;
      dark: string;
      fileDropzone: string;
      fileDropzoneSelected: string;
    };
    background: {
      default: string;
      lightgrey: string;
      darkgrey: string;
      grey: string;
      header: string;
      menuItemActive: string;
      filterItemActive: string;
      listItemActive: string;
      backdrop: string;
      tabFocus: string;
      fileDropzoneSelected: string;
    };
    transparent: string;
    buttonStates: {
      contained: {
        hoverOrFocus: {
          backgroundColor: string;
        };
        active: {
          backgroundColor: string;
        };
        disabled: {
          backgroundColor: string;
        };
      };
      outlined: {
        hoverOrFocus: {
          color: string;
          backgroundColor: string;
        };
        active: {
          color: string;
          backgroundColor: string;
        };
        disabled: {
          color: string;
          backgroundColor: string;
        };
      };
    };
    toggleButton: {
      color: string;
      hoverBackgroundColor: string;
      active: {
        color: string;
        backgroundColor: string;
        hoverBackgroundColor: string;
      };
    };
  }

  interface AppThemeTypography extends Typography {
    fontFamily: string;
    fullPageMessage: {
      fontSize: string;
      color: string;
    };
  }

  interface AppThemeTypographyOptions extends TypographyOptions {
    fontFamily: string;
    fullPageMessage?: {
      fontSize: string;
      color: string;
    };
  }

  interface AppThemeComponents extends Components {
    MuiAlert: object;
    MuiButtonBase: object;
    MuiButton: object;
    MuiCard: object;
    MuiCardHeader: object;
    MuiIconButton: object;
    MuiButtonGroup: object;
    MuiToggleButtonGroup: object;
    MuiToggleButton: object;
    MuiSelect: object;
    MuiTextField: object;
    MuiInputLabel: object;
    MuiOutlinedInput: object;
    MuiCheckbox: object;
    MuiTab: object;
    MuiTabs: object;
    MuiBadge: object;
    MuiDialog: object;
    MuiDialogTitle: object;
    MuiDialogActions: object;
    MuiDialogContentText: object;
    MuiTableCell: object;
    MuiTooltip: object;
    MuiDataGrid: object;
    MuiChip: object;
  }

  interface AppThemeComponentsOptions extends ComponentsOptions {
    MuiAlert: object;
    MuiButtonBase: object;
    MuiButton: object;
    MuiCard: object;
    MuiCardHeader: object;
    MuiIconButton: object;
    MuiButtonGroup: object;
    MuiToggleButtonGroup: object;
    MuiToggleButton: object;
    MuiSelect: object;
    MuiTextField: object;
    MuiInputLabel: object;
    MuiOutlinedInput: object;
    MuiCheckbox: object;
    MuiTab: object;
    MuiTabs: object;
    MuiBadge: object;
    MuiDialog: object;
    MuiDialogTitle: object;
    MuiDialogActions: object;
    MuiDialogContentText: object;
    MuiTableCell: object;
    MuiTooltip: object;
    MuiDataGrid: object;
    MuiChip: object;
  }

  interface AppTheme extends Theme {
    palette: AppThemePalette;
    typography: AppThemeTypography;
    breakpoints: Breakpoints;
    components: AppThemeComponents;
  }

  interface AppThemeOptions extends ThemeOptions {
    palette: AppThemePalette;
    typography: AppThemeTypographyOptions;
    breakpoints: BreakpointsOptions;
    components: AppThemeComponentsOptions;
  }
  export function createTheme(options?: AppThemeOptions): AppTheme;
}
