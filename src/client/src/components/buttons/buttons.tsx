import { forwardRef } from "react";
import TranslationText from "../legacyComponents/translationText";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "../../assets/icons/edit.svg?react";
import CopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import TrashIcon from "../../assets/icons/trash.svg?react";
import CheckmarkIcon from "../../assets/icons/checkmark.svg?react";
import { ButtonProps } from "./buttonsInterface";

export const BdmsBaseButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return (
    <Button
      ref={ref}
      {...props}
      data-cy={props.label?.toLowerCase() + "-button"}
      endIcon={props.icon}
      sx={{
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingBottom: "8px",
        paddingTop: "8px",
        whiteSpace: "nowrap",
        borderRadius: "2px",
        fontWeight: 500,
        minWidth: "auto",
      }}>
      <TranslationText firstUpperCase id={props.label} />
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

export const DeleteButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <BdmsBaseButton ref={ref} {...props} variant="outlined" icon={<TrashIcon />} />;
});
