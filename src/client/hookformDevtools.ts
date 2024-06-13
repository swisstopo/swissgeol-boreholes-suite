import * as hookFormDevTools from "@hookform/devtools";

export const DevTool: (typeof hookFormDevTools)["DevTool"] =
  process.env.NODE_ENV !== "development"
    ? function () {
        return null;
      }
    : hookFormDevTools.DevTool;

// Workaround to fix known issue of react hook form dev tools with vite. See also https://github.com/react-hook-form/devtools/issues/175
