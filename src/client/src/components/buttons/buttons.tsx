import { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, IconButton } from "@mui/material";
import { ArrowDownToLine, Check, ChevronLeft, Pencil, Plus, Save, Trash2 } from "lucide-react";
import CopyIcon from "../../assets/icons/copy.svg?react";
import { capitalizeFirstLetter } from "../../utils.ts";
import { ButtonProps } from "./buttonsInterface";

export const BoreholesBaseButton: FC<ButtonProps> = props => {
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

export const BoreholesButton: FC<ButtonProps> = props => {
  return <BoreholesBaseButton {...props} label={props.label} />;
};

export const AddButton: FC<ButtonProps> = props => {
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

export const EditButton: FC<ButtonProps> = props => {
  return (
    <BoreholesBaseButton
      {...props}
      label={props.label ?? "edit"}
      variant={props.variant ?? "contained"}
      icon={<Pencil />}
    />
  );
};

export const BulkEditButton: FC<ButtonProps> = props => {
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

export const EndEditButton: FC<ButtonProps> = props => {
  return <BoreholesBaseButton {...props} label="editingStop" variant={props.variant ?? "contained"} icon={<Check />} />;
};

export const CopyButton: FC<ButtonProps> = props => {
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

export const CancelButton: FC<ButtonProps> = props => {
  return (
    <BoreholesBaseButton
      {...props}
      label="cancel"
      variant={props.variant ?? "outlined"}
      color={props.color ?? "secondary"}
    />
  );
};

export const SaveButton: FC<ButtonProps> = props => {
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

export const AcceptButton: FC<ButtonProps> = props => {
  return <BoreholesBaseButton {...props} label="accept" variant={props.variant ?? "contained"} />;
};

export const DeleteButton: FC<ButtonProps> = props => {
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

export const ExportButton: FC<ButtonProps> = props => {
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

export const ReturnButton: FC<{ onClick: () => void }> = ({ onClick }) => {
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

interface FileButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

export const FileButton: FC<FileButtonProps> = ({ label, icon, onClick }) => {
  return (
    <Button
      startIcon={icon}
      variant="outlined"
      data-cy="file-button"
      sx={{ justifyContent: "start", height: "36px" }}
      onClick={event => {
        event.stopPropagation();
        onClick();
      }}>
      <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</Box>
    </Button>
  );
};
