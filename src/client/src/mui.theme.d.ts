import { Theme, ThemeOptions } from "@mui/material/styles";
import { ComponentType, SVGProps } from "react";

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
      main: string;
      secondary: string;
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
    };
    border: string;
  }

  interface AppThemeTypography {
    fontFamily: string;
    h6: {
      fontSize: string;
      lineHeight: string;
      fontWeight: number | string;
      color: string;
    };
    h5: {
      fontSize: string;
      lineHeight: string;
      fontWeight: number | string;
      color: string;
    };
    h2: {
      fontSize: string;
      lineHeight: string;
      fontWeight: number | string;
      color: string;
    };
    subtitle1: {
      fontSize: string;
      color: string;
      lineHeight: string;
    };
    subtitle2: {
      fontSize: string;
      color: string;
      lineHeight: string;
    };
    body2: {
      fontSize: string;
    };
    fullPageMessage: {
      fontSize: string;
      color: string;
    };
  }

  interface AppThemeBreakpoints {
    values: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
  }

  interface AppThemeComponents {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: boolean;
      };
    };
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: string;
          fontWeight: string | number;
          textTransform: string;
          whiteSpace: string;
          minWidth: string;
          marginLeft: string;
          padding: string;
          borderRadius: string;
          boxShadow: string;
          "&:hover": {
            boxShadow: string;
          };
        };
        contained: {
          backgroundColor: string;
          "&:hover": {
            backgroundColor: string;
          };
          "&:focus-visible": {
            backgroundColor: string;
            boxShadow: string;
          };
          "&:active": {
            backgroundColor: string;
          };
          "&:disabled": {
            backgroundColor: string;
          };
        };
        outlined: {
          color: string;
          backgroundColor: string;
          "&:hover": {
            color: string;
            backgroundColor: string;
          };
          "&:focus-visible": {
            color: string;
            backgroundColor: string;
            boxShadow: string;
          };
          "&:active": {
            color: string;
            backgroundColor: string;
          };
          "&:disabled": {
            backgroundColor: string;
            color: string;
          };
        };
      };
    };
    MuiIconButton: {
      styleOverrides: {
        root: {
          "& .MuiTouchRipple-root": {
            display: string;
          };
        };
        colorPrimary: {
          backgroundColor: string;
          color: string;
          "&:hover": {
            backgroundColor: string;
          };
          "&:focus-visible": {
            backgroundColor: string;
            boxShadow: string;
          };
          "&:active": {
            backgroundColor: string;
          };
          "&:disabled": {
            backgroundColor: string;
          };
        };
        colorError: {
          "&:hover": {
            color: string;
            backgroundColor: string;
          };
        };
        colorAi: {
          color: string;
          background: string;
          "&:hover": {
            background: string;
          };
          "&:focus-visible": {
            background: string;
            boxShadow: string;
          };
          "&:active": {
            background: string;
          };
          "&:disabled": {
            background: string;
          };
        };
      };
    };
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          backgroundColor: string;
        };
      };
    };
    MuiToggleButton: {
      styleOverrides: {
        root: {
          border: string;
          borderRadius: string;
          margin: string;
          padding: string;
          color: string;
          "&.Mui-selected": {
            color: string;
            backgroundColor: string;
          };
        };
      };
    };
    MuiSelect: {
      defaultProps: {
        IconComponent: ComponentType<SVGProps<SVGSVGElement> & { title?: string | undefined }>;
      };
    };
    MuiFormControl: {
      styleOverrides: {
        root: {
          "& .MuiFilledInput-root": {
            backgroundColor: string;
          };
          "& .MuiFilledInput-root:hover:not(.Mui-disabled, .Mui-error):before": {
            borderColor: string;
          };
          "& .MuiFilledInput-root:not(.Mui-error):before": {
            borderColor: string;
          };
          "& .MuiFilledInput-root:not(.Mui-error):after": {
            borderColor: string;
          };
        };
      };
    };
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: string;
          fontWeight: string | number;
          textTransform: string;
          fontSize: string;
        };
      };
    };
    MuiBadge: {
      styleOverrides: {
        badge: {
          backgroundColor: string;
          color: string;
        };
      };
    };
    MuiDialogContentText: {
      styleOverrides: {
        root: {
          fontSize: string;
          color: string;
        };
      };
    };
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontSize: string;
          fontWeight: number | string;
          padding: string;
          flex: number | string;
          verticalAlign: string;
        };
        body: {
          paddingRight: string;
          paddingLeft: string;
          flex: number | string;
          fontSize: string;
        };
      };
    };
  }

  interface AppTheme extends Theme {
    palette: AppThemePalette;
    typography: AppThemeTypography;
    breakpoints: AppThemeBreakpoints;
    components: AppThemeComponents;
  }

  // allow configuration using `createTheme`
  interface AppThemeOptions extends ThemeOptions {
    palette: AppThemePalette;
    typography: AppThemeTypography;
    breakpoints: AppThemeBreakpoints;
    components: AppThemeComponents;
  }
  export function createTheme(options?: AppThemeOptions): AppTheme;
}
