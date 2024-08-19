import { useEffect, useState } from "react";
import Markdown from "markdown-to-jsx";

export const MarkdownWrapper = ({ markdownContent }: { markdownContent: string }) => {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    const handleRender = () => {
      setIsRendered(true);
    };
    // First rendering cycle completes once the markdown is rendered. Then "isRendered" will be set to true and then dialog is displayed.
    // Avoids flickering of the markdown content.
    const timer = setTimeout(handleRender, 0);
    return () => clearTimeout(timer);
  }, [markdownContent]);

  return (
    <div>
      <div style={{ display: isRendered ? "block" : "none" }}>
        <Markdown>{markdownContent}</Markdown>
      </div>
    </div>
  );
};
