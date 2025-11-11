import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Tooltip } from "@mui/material";

export const useLabelOverflow = (label: string | undefined) => {
  const [isLabelOverflowing, setIsLabelOverflowing] = useState(false);
  const labelRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const checkOverflow = () => {
      if (labelRef.current) {
        const labelElementWidth = labelRef.current.getBoundingClientRect().width;
        const inputElementWidth =
          labelRef.current.parentElement?.parentElement?.parentElement?.getBoundingClientRect().width;
        setIsLabelOverflowing(labelElementWidth + 34 > (inputElementWidth ?? 0)); // Account for padding and label offset
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => window.removeEventListener("resize", checkOverflow);
  }, [label]);

  const translatedLabel = label ? t(label) : "";

  const labelWithTooltip = (
    <Tooltip title={isLabelOverflowing ? translatedLabel : ""} placement="top">
      <Box
        ref={labelRef}
        sx={{
          display: "block",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
        {translatedLabel}
      </Box>
    </Tooltip>
  );

  return { labelWithTooltip };
};
