import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@mui/material";
import { ChevronDownIcon } from "lucide-react";

interface SelectPopupIconProps {
  open: boolean;
}

/**
 * Chevron for the Autocomplete popup indicator with the app's MUI tooltip. The indicator button must be
 * rendered without its native title (popupIndicator slot prop `title: undefined`), otherwise both tooltips appear.
 */
export const SelectPopupIcon: FC<SelectPopupIconProps> = ({ open }) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t(open ? "close" : "open")}>
      <ChevronDownIcon />
    </Tooltip>
  );
};
