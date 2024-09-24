import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { Button } from "@mui/material";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import CopyIcon from "../../assets/icons/copy.svg?react";

import { capitalizeFirstLetter } from "../../utils.ts";
import { ButtonProps } from "./buttonsInterface";

export const BdmsBaseButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { t } = useTranslation();
  return (
    <Button ref={ref} {...props} data-cy={props.label?.toLowerCase() + "-button"} startIcon={props.icon}>
      {props.label && capitalizeFirstLetter(t(props.label))}
    </Button>
  );
});

export const BdmsButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <BdmsBaseButton ref={ref} {...props} label={props.label} />;
});

export const AddButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return (
    <BdmsBaseButton
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
  return <BdmsBaseButton ref={ref} {...props} label="edit" variant={props.variant ?? "contained"} icon={<Pencil />} />;
});

export const BulkEditButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return (
    <BdmsBaseButton
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
    <BdmsBaseButton ref={ref} {...props} label="editingStop" variant={props.variant ?? "contained"} icon={<Check />} />
  );
});

export const CopyButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return (
    <BdmsBaseButton
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
    <BdmsBaseButton
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
    <BdmsBaseButton
      ref={ref}
      {...props}
      label="save"
      variant={props.variant ?? "outlined"}
      color={props.color ?? "secondary"}
      icon={<SaveIcon />}
    />
  );
});

export const AcceptButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <BdmsBaseButton ref={ref} {...props} label="accept" variant={props.variant ?? "contained"} />;
});

export const DeleteButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return (
    <BdmsBaseButton
      ref={ref}
      {...props}
      variant={props.variant ?? "outlined"}
      color={props.color ?? "secondary"}
      icon={<Trash2 />}
    />
  );
});
