import React, { forwardRef } from "react";
import TranslationText from "../../commons/form/translationText";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import CopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

export const BdmsBaseButton = forwardRef((props, ref) => {
  return (
    <Button
      ref={ref}
      {...props}
      variant="outlined"
      size="small"
      data-cy={props.label + "-button"}
      startIcon={props.icon}>
      <TranslationText firstUpperCase id={props.label} />
    </Button>
  );
});

export const AddButton = forwardRef((props, ref) => {
  return (
    <BdmsBaseButton
      ref={ref}
      {...props}
      label={props.label}
      icon={<AddIcon />}
    />
  );
});

export const EditButton = forwardRef((props, ref) => {
  return (
    <BdmsBaseButton ref={ref} {...props} label="edit" icon={<ModeEditIcon />} />
  );
});

export const CopyButton = forwardRef((props, ref) => {
  return (
    <BdmsBaseButton ref={ref} {...props} label="copy" icon={<CopyIcon />} />
  );
});

export const CancelButton = forwardRef((props, ref) => {
  return (
    <BdmsBaseButton ref={ref} {...props} label="cancel" icon={<CloseIcon />} />
  );
});

export const SaveButton = forwardRef((props, ref) => {
  return (
    <BdmsBaseButton ref={ref} {...props} label="save" icon={<SaveIcon />} />
  );
});

export const DeleteButton = forwardRef((props, ref) => {
  return (
    <Button
      ref={ref}
      {...props}
      variant="contained"
      color="error"
      size="small"
      data-cy="delete-button"
      startIcon={<DeleteIcon />}>
      <TranslationText firstUpperCase id="delete" />
    </Button>
  );
});
