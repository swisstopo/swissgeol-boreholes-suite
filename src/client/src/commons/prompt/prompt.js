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
import { styled } from "@mui/system";

export const PromptButton = styled(Button)({
  fontFamily: "Lato",
  textTransform: "none",
  color: "rgba(0, 0, 0, 0.8)",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
});

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
          <PromptButton
            key={index}
            onClick={() => {
              if (action.action != null) {
                action.action();
              }
              setOpen(false);
            }}>
            {t(action.label)}
          </PromptButton>
        ))}
      </DialogActions>
    </Dialog>
  );
};

export default Prompt;
