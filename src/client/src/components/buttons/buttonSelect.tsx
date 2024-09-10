import { Button, ButtonProps, List, ListItem, ListItemIcon, ListItemText, Popover } from "@mui/material";
import { theme } from "../../AppTheme.ts";
import { FC, MouseEvent, ReactNode, useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

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
        variant={variant ?? "text"}
        color={color ?? "primary"}
        onClick={handleClick}
        startIcon={startIcon}
        endIcon={anchorEl ? <ChevronUp /> : <ChevronDown />}
        className={isOpen ? "Mui-active" : ""}
        data-cy={`${fieldName}-button-select`}>
        {selectedItem?.value}
      </Button>
      <Popover
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        sx={{ marginTop: "5px" }}
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
                {selectedItem.key === item.key ? <Check /> : item.startIcon && item.startIcon}
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
