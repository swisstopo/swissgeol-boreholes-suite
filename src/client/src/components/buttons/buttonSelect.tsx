import { FC, MouseEvent, ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  ButtonProps,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Popover,
  SxProps,
  TextField,
} from "@mui/material";
import { Check, ChevronDown, ChevronUp, Search } from "lucide-react";
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
  search?: string;
  onSearch?: (search: string) => void;
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
  search,
  onSearch,
  startIcon,
  variant,
  color,
  anchorOrigin,
  transformOrigin,
  textAlign,
  sx,
  className,
}) => {
  const { t } = useTranslation();
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
        className={`${isOpen ? "Mui-active" : ""} ${className ?? ""}`}
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
        {typeof search === "string" && onSearch && (
          <Box sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.border.light}` }}>
            <TextField
              sx={{ m: 0 }}
              placeholder={t("filter") + "…"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              value={search}
              onChange={e => onSearch(e.target.value)}
              data-cy={`${fieldName}-button-select-search`}
            />
          </Box>
        )}
        <List sx={{ padding: 0, overflowY: "auto", maxHeight: "400px" }}>
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
