import { Theme, ThemeOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface CustomTheme extends Theme {
    palette: {
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
    };
    typography: {
      fontFamily: string;
      h6: {
        fontSize: string;
        color: string;
        lineHeight: string;
        fontWeight: number;
      };
      h5: {
        fontSize: string;
        color: string;
        lineHeight: string;
        fontWeight: number;
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
      fullPageMessage: {
        fontSize: string;
        color: string;
      };
    };
  }
  // allow configuration using `createTheme`
  interface CustomThemeOptions extends ThemeOptions {
    palette?: {
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
    };
    typography: {
      fontFamily: string;
      h6: {
        fontSize: string;
        color: string;
        lineHeight: string;
        fontWeight: number;
      };
      h5: {
        fontSize: string;
        color: string;
        lineHeight: string;
        fontWeight: number;
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
      fullPageMessage: {
        fontSize: string;
        color: string;
      };
    };
  }
  export function createTheme(options?: CustomThemeOptions): CustomTheme;
}
