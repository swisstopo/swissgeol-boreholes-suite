import { FC, MouseEvent } from "react";
import { Box, IconButton, Theme } from "@mui/material";
import { SystemStyleObject } from "@mui/system";
import { Plus } from "lucide-react";
import { theme } from "../../../../../AppTheme.ts";

interface LayerAddButtonProps {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  dataCy?: string;
  size?: "small" | "default";
  sx?: SystemStyleObject<Theme>;
}

const hoverOrFocusBackgroundColor = theme.palette.buttonStates.contained.hoverOrFocus.backgroundColor;

const circleSx = (diameter: number): SystemStyleObject<Theme> => ({
  padding: 0,
  borderRadius: "50%",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  width: diameter,
  height: diameter,
});

export const LayerAddButton: FC<LayerAddButtonProps> = ({ onClick, dataCy, size = "default", sx }) => {
  const isSmall = size === "small";
  return (
    <IconButton
      onClick={onClick}
      data-cy={dataCy}
      sx={{
        ...circleSx(isSmall ? 24 : 36),
        "&:hover": {
          backgroundColor: hoverOrFocusBackgroundColor,
        },
        ...sx,
      }}>
      <Plus />
    </IconButton>
  );
};

// The look of a LayerAddButton for inside a button that handles the click itself, as a button
// must not contain another one.
export const LayerAddIcon: FC = () => (
  <Box
    component="span"
    sx={{
      ...circleSx(36),
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
      transition: theme.transitions.create("background-color", { duration: theme.transitions.duration.shortest }),
      "button:hover &, button:focus-visible &": {
        backgroundColor: hoverOrFocusBackgroundColor,
      },
    }}>
    <Plus />
  </Box>
);
