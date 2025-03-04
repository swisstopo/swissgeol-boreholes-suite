import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, IconButton } from "@mui/material";
import { ArrowDownToLine, Check, ChevronLeft, Pencil, Plus, Save, Trash2 } from "lucide-react";
import CopyIcon from "../../assets/icons/copy.svg?react";
import SelectTextIcon from "../../assets/icons/selectText.svg?react";
import { theme } from "../../AppTheme.ts";
import { capitalizeFirstLetter } from "../../utils.ts";
import { ButtonProps } from "./buttonsInterface";

export const BoreholesBaseButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { t } = useTranslation();
  // As of now there is no variant "contained" with color "secondary" in the design system, fallback to "primary".
  const color = props.variant === "contained" ? "primary" : (props.color ?? "primary");
  return (
    <Button
      ref={ref}
      {...props}
      data-cy={props.label?.toLowerCase() + "-button"}
      color={color}
      endIcon={props.icon}
      sx={{ height: "36px" }}>
      {props.label && capitalizeFirstLetter(t(props.label))}
    </Button>
  );
});

export const BoreholesButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <BoreholesBaseButton ref={ref} {...props} label={props.label} />;
});

export const AddButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return (
    <BoreholesBaseButton
      ref={ref}
      {...props}
      label={props.label}
      variant={props.variant ?? "outlined"}
      color={props.color ?? "secondary"}
      icon={<Plus />}
    />
  );
});

export const EditButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return (
    <BoreholesBaseButton ref={ref} {...props} label="edit" variant={props.variant ?? "contained"} icon={<Pencil />} />
  );
});

export const BulkEditButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return (
    <BoreholesBaseButton
      ref={ref}
      {...props}
      label="bulkEditing"
      variant={props.variant ?? "outlined"}
      color={props.color ?? "secondary"}
      icon={<Pencil />}
    />
  );
});

export const EndEditButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return (
    <BoreholesBaseButton
      ref={ref}
      {...props}
      label="editingStop"
      variant={props.variant ?? "contained"}
      icon={<Check />}
    />
  );
});

export const CopyButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return (
    <BoreholesBaseButton
      ref={ref}
      {...props}
      label="copy"
      variant={props.variant ?? "outlined"}
      color={props.color ?? "secondary"}
      icon={<CopyIcon />}
    />
  );
});

export const CancelButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return (
    <BoreholesBaseButton
      ref={ref}
      {...props}
      label="cancel"
      variant={props.variant ?? "outlined"}
      color={props.color ?? "secondary"}
      icon={<CloseIcon />}
    />
  );
});

export const SaveButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return (
    <BoreholesBaseButton
      ref={ref}
      {...props}
      label="save"
      variant={props.variant ?? "outlined"}
      color={props.color ?? "secondary"}
      icon={<Save />}
    />
  );
});

export const AcceptButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <BoreholesBaseButton ref={ref} {...props} label="accept" variant={props.variant ?? "contained"} />;
});

export const DeleteButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return (
    <BoreholesBaseButton
      ref={ref}
      {...props}
      label={props.label ?? "delete"}
      variant={props.variant ?? "outlined"}
      color={props.color ?? "secondary"}
      icon={<Trash2 />}
    />
  );
});

export const ExportButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return (
    <BoreholesBaseButton
      ref={ref}
      {...props}
      label={props.label ?? "export"}
      variant={props.variant ?? "outlined"}
      color={props.color ?? "secondary"}
      icon={<ArrowDownToLine />}
    />
  );
});

export const ReturnButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <IconButton
      color="primary"
      data-cy="backButton"
      onClick={onClick}
      sx={{
        width: "36px",
        height: "36px",
        borderRadius: "2px",
      }}>
      <ChevronLeft />
    </IconButton>
  );
};

export const TextExtractionButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      data-cy="text-extraction-button"
      variant="text"
      onClick={onClick}
      sx={{
        p: 0.5,
        boxShadow: 1,
        height: "44px",
      }}>
      <Box
        sx={{
          p: 1,
          lineHeight: 1,
          borderRadius: 1,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}>
        <SelectTextIcon />
      </Box>
    </Button>
  );
};
