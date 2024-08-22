import { forwardRef } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "../../assets/icons/edit.svg?react";
import CopyIcon from "../../assets/icons/copy.svg?react";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import TrashIcon from "../../assets/icons/trash.svg?react";
import CheckmarkIcon from "../../assets/icons/checkmark.svg?react";
import { ButtonProps } from "./buttonsInterface";
import { capitalizeFirstLetter } from "../../utils.ts";
import { useTranslation } from "react-i18next";

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
  return <BdmsBaseButton ref={ref} {...props} label={props.label} variant="outlined" icon={<AddIcon />} />;
});

export const EditButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <BdmsBaseButton ref={ref} {...props} label="edit" variant="contained" icon={<EditIcon />} />;
});

export const BulkEditButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <BdmsBaseButton ref={ref} {...props} label="bulkEditing" variant="outlined" icon={<EditIcon />} />;
});

export const EndEditButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <BdmsBaseButton ref={ref} {...props} label="editingStop" variant="contained" icon={<CheckmarkIcon />} />;
});

export const CopyButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <BdmsBaseButton ref={ref} {...props} label="copy" variant="outlined" icon={<CopyIcon />} />;
});

export const CancelButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <BdmsBaseButton ref={ref} {...props} label="cancel" variant="outlined" icon={<CloseIcon />} />;
});

export const SaveButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <BdmsBaseButton ref={ref} {...props} label="save" variant="outlined" icon={<SaveIcon />} />;
});

export const AcceptButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <BdmsBaseButton ref={ref} {...props} label="accept" variant="contained" />;
});

export const DeleteButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <BdmsBaseButton ref={ref} {...props} variant="outlined" icon={<TrashIcon />} />;
});

export const SavePrimaryButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <BdmsBaseButton ref={ref} {...props} label="save" variant="contained" icon={<SaveIcon />} />;
});
