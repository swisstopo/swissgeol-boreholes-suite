import { FC, MouseEvent } from "react";
import { IconButton, SxProps } from "@mui/material";
import { Plus } from "lucide-react";
import { theme } from "../../../../../AppTheme.ts";

interface LayerAddButtonProps {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  dataCy?: string;
  size?: "small" | "default";
  sx?: SxProps;
}

export const LayerAddButton: FC<LayerAddButtonProps> = ({ onClick, dataCy, size = "default", sx }) => {
  const isSmall = size === "small";
  return (
    <IconButton
      onClick={onClick}
      data-cy={dataCy}
      sx={{
        padding: 0,
        borderRadius: "50%",
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        width: isSmall ? 24 : 36,
        height: isSmall ? 24 : 36,
        "&:hover": {
          backgroundColor: theme.palette.buttonStates.contained.hoverOrFocus.backgroundColor,
        },
        ...sx,
      }}>
      <Plus />
    </IconButton>
  );
};
