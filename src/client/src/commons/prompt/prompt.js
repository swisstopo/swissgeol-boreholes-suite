import React from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

const Prompt = props => {
  const { open, setOpen, titleLabel, messageLabel, actions } = props;
  const { t } = useTranslation();
  return (
    <Dialog open={open}>
      <DialogTitle id="alert-dialog-title">{t(titleLabel)}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {t(messageLabel)}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {actions?.map((action, index) => (
          <Button
            key={index}
            onClick={() => {
              if (action.action != null) {
                action.action();
              }
              setOpen(false);
            }}>
            {t(action.label)}
          </Button>
        ))}
      </DialogActions>
    </Dialog>
  );
};

export default Prompt;
