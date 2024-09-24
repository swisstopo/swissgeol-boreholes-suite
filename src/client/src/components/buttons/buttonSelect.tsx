import { FC, MouseEvent, ReactNode, useState } from "react";
import { Button, ButtonProps, List, ListItem, ListItemIcon, ListItemText, Popover, SxProps } from "@mui/material";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { theme } from "../../AppTheme.ts";

export interface ButtonSelectItem {
  key: number | string;
  value: string;
  startIcon?: ReactNode;
}

interface ButtonSelectProps {
  fieldName: string;
  items: ButtonSelectItem[];
  selectedItem: ButtonSelectItem;
  onItemSelected: (item: ButtonSelectItem) => void;
  startIcon?: ReactNode;
  variant?: ButtonProps["variant"];
  color?: ButtonProps["color"];
  anchorOrigin?: { vertical: "top" | "center" | "bottom"; horizontal: "left" | "center" | "right" };
  transformOrigin?: { vertical: "top" | "center" | "bottom"; horizontal: "left" | "center" | "right" };
  textAlign?: "left" | "right";
  sx?: SxProps;
  className?: string;
}

export const ButtonSelect: FC<ButtonSelectProps> = ({
  fieldName,
  items,
  selectedItem,
  onItemSelected,
  startIcon,
  variant,
  color,
  anchorOrigin,
  transformOrigin,
  textAlign,
  sx,
  className,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();
  const isOpen = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  return (
    <>
      <Button
        variant={variant}
        color={color}
        onClick={handleClick}
        startIcon={startIcon}
        endIcon={anchorEl ? <ChevronUp /> : <ChevronDown />}
        className={`${isOpen ? "Mui-active" : ""} ${className || ""}`}
        data-cy={`${fieldName}-button-select`}
        sx={{ ...sx }}>
        {selectedItem?.value}
      </Button>
      <Popover
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        sx={{ marginTop: 0.5 }}
        anchorOrigin={anchorOrigin ?? { vertical: "bottom", horizontal: "left" }}
        transformOrigin={transformOrigin ?? { vertical: "top", horizontal: "left" }}
        data-cy="button-select-popover">
        <List sx={{ padding: 0 }}>
          {items.map(item => (
            <ListItem
              key={item.key}
              data-cy={`${item.key}-button-select-item`}
              onClick={() => {
                onItemSelected(item);
                handleClose();
              }}
              sx={{
                cursor: "pointer",
                gap: 1,
                "&:hover": { backgroundColor: theme.palette.background.listItemActive },
              }}>
              <ListItemIcon sx={{ minWidth: "20px" }}>
                {selectedItem.key === item.key ? <Check /> : item.startIcon}
              </ListItemIcon>
              <ListItemText
                sx={{
                  textAlign: textAlign ?? "left",
                  minWidth: "24px",
                  paddingLeft: "5px",
                  fontSize: "14px",
                }}>
                {item.value}
              </ListItemText>
            </ListItem>
          ))}
        </List>
      </Popover>
    </>
  );
};
