import { Theme, ThemeOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface CustomTheme extends Theme {
    palette: {
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
      };
      buttonSelected: string;
    };
    typography: {
      fontFamily: string;
      h5: {
        fontSize: string;
        color: string;
        lineHeight: string;
        fontWeight: number;
        marginBottom: string;
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
      };
      buttonSelected: string;
    };
    typography: {
      fontFamily: string;
      h5: {
        fontSize: string;
        color: string;
        lineHeight: string;
        fontWeight: number;
        marginBottom: string;
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