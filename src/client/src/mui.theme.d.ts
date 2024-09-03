import { Theme, ThemeOptions } from "@mui/material/styles";

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    ai: true;
  }
}

declare module "@mui/material/IconButton" {
  interface IconButtonPropsColorOverrides {
    ai: true;
  }
}

declare module "@mui/material/styles" {
  interface Palette {
    ai: Palette["ai"];
  }

  interface PaletteOptions {
    ai?: PaletteOptions["ai"];
  }

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
        mainTop: string;
        mainBottom: string;
        activeTop: string;
        activeBottom: string;
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
      h2: {
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
      body2: {
        fontSize: string;
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
        mainTop: string;
        mainBottom: string;
        activeTop: string;
        activeBottom: string;
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
      h2: {
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
      body2: {
        fontSize: string;
      };
      fullPageMessage: {
        fontSize: string;
        color: string;
      };
    };
  }
  export function createTheme(options?: CustomThemeOptions): CustomTheme;
}
