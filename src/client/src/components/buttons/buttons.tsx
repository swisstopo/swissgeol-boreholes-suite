import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";
import { Button, IconButton } from "@mui/material";
import { ArrowDownToLine, Check, ChevronLeft, Pencil, Plus, Save, Trash2 } from "lucide-react";
import CopyIcon from "../../assets/icons/copy.svg?react";
import { capitalizeFirstLetter } from "../../utils.ts";
import { ButtonProps } from "./buttonsInterface";

export const BoreholesBaseButton = (props: ButtonProps) => {
  const { t } = useTranslation();
  // As of now there is no variant "contained" with color "secondary" in the design system, fallback to "primary".
  const color = props.variant === "contained" ? "primary" : (props.color ?? "primary");
  return (
    <Button
      {...props}
      data-cy={props.dataCy ?? props.label?.toLowerCase() + "-button"}
      color={color}
      endIcon={props.icon}
      sx={{ height: "36px" }}>
      {props.label && capitalizeFirstLetter(t(props.label))}
    </Button>
  );
};

export const BoreholesButton = (props: ButtonProps) => {
  return <BoreholesBaseButton {...props} label={props.label} />;
};

export const AddButton = (props: ButtonProps) => {
  return (
    <BoreholesBaseButton
      {...props}
      label={props.label ?? "add"}
      variant={props.variant ?? "outlined"}
      color={props.color ?? "secondary"}
      icon={<Plus />}
    />
  );
};

export const EditButton = (props: ButtonProps) => {
  return <BoreholesBaseButton {...props} label="edit" variant={props.variant ?? "contained"} icon={<Pencil />} />;
};

export const BulkEditButton = (props: ButtonProps) => {
  return (
    <BoreholesBaseButton
      {...props}
      label="bulkEditing"
      variant={props.variant ?? "outlined"}
      color={props.color ?? "secondary"}
      icon={<Pencil />}
    />
  );
};

export const EndEditButton = (props: ButtonProps) => {
  return <BoreholesBaseButton {...props} label="editingStop" variant={props.variant ?? "contained"} icon={<Check />} />;
};

export const CopyButton = (props: ButtonProps) => {
  return (
    <BoreholesBaseButton
      {...props}
      label="copy"
      variant={props.variant ?? "outlined"}
      color={props.color ?? "secondary"}
      icon={<CopyIcon />}
    />
  );
};

export const CancelButton = (props: ButtonProps) => {
  return (
    <BoreholesBaseButton
      {...props}
      label="cancel"
      variant={props.variant ?? "outlined"}
      color={props.color ?? "secondary"}
      icon={<CloseIcon />}
    />
  );
};

export const SaveButton = (props: ButtonProps) => {
  return (
    <BoreholesBaseButton
      {...props}
      label="save"
      variant={props.variant ?? "outlined"}
      color={props.color ?? "secondary"}
      icon={<Save />}
    />
  );
};

export const AcceptButton = (props: ButtonProps) => {
  return <BoreholesBaseButton {...props} label="accept" variant={props.variant ?? "contained"} />;
};

export const DeleteButton = (props: ButtonProps) => {
  return (
    <BoreholesBaseButton
      {...props}
      label={props.label ?? "delete"}
      variant={props.variant ?? "outlined"}
      color={props.color ?? "secondary"}
      icon={<Trash2 />}
    />
  );
};

export const ExportButton = (props: ButtonProps) => {
  return (
    <BoreholesBaseButton
      {...props}
      label={props.label ?? "export"}
      variant={props.variant ?? "outlined"}
      color={props.color ?? "secondary"}
      icon={<ArrowDownToLine />}
    />
  );
};

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
