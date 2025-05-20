import { Typography } from "@mui/material";
import { Theme, ThemeOptions } from "@mui/material/styles";
import { TypographyOptions } from "@mui/material/styles/createTypography";
import { Breakpoints } from "@mui/system";
import { BreakpointsOptions } from "@mui/system/createTheme/createBreakpoints";

declare module "@mui/material/IconButton" {
  interface IconButtonPropsColorOverrides {
    ai: true;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    fullPageMessage: true;
  }
}

declare module "@mui/material/styles" {
  export interface AppThemePalette {
    action: {
      disabled: string;
    };
    primary: {
      main: string;
      contrastText: string;
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
    warning: {
      main: string;
    };
    error: {
      main: string;
      dark: string;
      light: string;
      contrastText: string;
      background: string;
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
    };
    border: {
      light: string;
      darker: string;
      dark: string;
    };
    background: {
      default: string;
      lightgrey: string;
      darkgrey: string;
      grey: string;
      dark: string;
      menuItemActive: string;
      filterItemActive: string;
      listItemActive: string;
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
    MuiDialogTitle: object;
    MuiDialogActions: object;
    MuiDialogContentText: object;
    MuiTableCell: object;
    MuiTooltip: object;
    MuiDataGrid: object;
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
    MuiDialogTitle: object;
    MuiDialogActions: object;
    MuiDialogContentText: object;
    MuiTableCell: object;
    MuiTooltip: object;
    MuiDataGrid: object;
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
