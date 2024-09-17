import { Theme, ThemeOptions } from "@mui/material/styles";
import { Breakpoints } from "@mui/system";
import { BreakpointsOptions } from "@mui/system/createTheme/createBreakpoints";
import { Typography } from "@mui/material";
import { TypographyOptions } from "@mui/material/styles/createTypography";

declare module "@mui/material/IconButton" {
  interface IconButtonPropsColorOverrides {
    ai: true;
  }
}

declare module "@mui/material/styles" {
  interface AppThemePalette {
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
    success: {
      main: string;
    };
    warning: {
      main: string;
    };
    error: {
      main: string;
      dark: string;
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
      main: string;
      mainEnd: string;
      active: string;
      activeEnd: string;
      contrastText: string;
    };
    boxShadow: string;
    background: {
      default: string;
      lightgrey: string;
      darkgrey: string;
      dark: string;
      menuItemActive: string;
      filterItemActive: string;
      listItemActive: string;
    };
    border: string;
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
    MuiButtonBase: object;
    MuiButton: object;
    MuiCard: object;
    MuiCardHeader: object;
    MuiIconButton: object;
    MuiButtonGroup: object;
    MuiToggleButtonGroup: object;
    MuiToggleButton: object;
    MuiSelect: object;
    MuiFormControl: object;
    MuiTab: object;
    MuiBadge: object;
    MuiDialogContentText: object;
    MuiTableCell: object;
    MuiTooltip: object;
  }

  interface AppThemeComponentsOptions extends ComponentsOptions {
    MuiButtonBase: object;
    MuiButton: object;
    MuiCard: object;
    MuiCardHeader: object;
    MuiIconButton: object;
    MuiButtonGroup: object;
    MuiToggleButtonGroup: object;
    MuiToggleButton: object;
    MuiSelect: object;
    MuiFormControl: object;
    MuiTab: object;
    MuiBadge: object;
    MuiDialogContentText: object;
    MuiTableCell: object;
    MuiTooltip: object;
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
