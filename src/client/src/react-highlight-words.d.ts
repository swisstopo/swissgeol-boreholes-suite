declare module "react-highlight-words" {
  import { ComponentType } from "react";

  interface HighlighterProps {
    searchWords: string[];
    textToHighlight: string;
    autoEscape?: boolean;
    highlightClassName?: string;
    [key: string]: unknown;
  }

  const Highlighter: ComponentType<HighlighterProps>;
  export default Highlighter;
}
