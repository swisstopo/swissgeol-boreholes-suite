import { forwardRef, ReactNode, useState } from "react";
import { IconButton, Stack, Typography } from "@mui/material";
import { theme } from "../../AppTheme";
import { ButtonProps } from "./buttonsInterface";

export interface NavButtonProps extends ButtonProps {
  label: string;
  icon: ReactNode;
  selected?: boolean;
}

export const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>((props, ref) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const defaultContent = props.icon;
  const hoverContent = (
    <>
      {props.icon} <Typography>{props.label}</Typography>
    </>
  );
  return (
    <IconButton
      ref={ref}
      {...props}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        marginBottom: "25px",
        padding: "10px 16px",
        color: props.selected ? theme.palette.primary.contrastText : theme.palette.neutral.contrastText,
        backgroundColor: props.selected
          ? theme.palette.background.menuItemActive + " !important"
          : "rgba(0, 0, 0, 0.0)",
        borderRadius: "10px",
        width: "fit-content",
        transition: "background-color 0.3s ease, color 0.3s ease, width 0.3s ease",
        "&:hover": {
          backgroundColor: `${theme.palette.buttonStates.contained.hoverOrFocus.backgroundColor} !important`,
          color: `${theme.palette.primary.contrastText} !important`,
          width: "fit-content",
          whiteSpace: "nowrap",
          zIndex: 6000,
        },
      }}>
      <Stack direction="row" justifyContent={"space-between"} spacing={1} sx={{ margin: 0 }}>
        {isHovered ? hoverContent : defaultContent}
      </Stack>
    </IconButton>
  );
});
