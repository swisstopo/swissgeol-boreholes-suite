import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogProps, Stack, Typography } from "@mui/material";

import { AcceptButton } from "../components/buttons/buttons.tsx";
import { LanguagePopup } from "../components/header/languagePopup.tsx";
import { DialogFooterContainer, DialogHeaderContainer, DialogMainContent } from "../components/styledComponents.ts";
import { MarkdownWrapper } from "./markdownWrapper.tsx";

interface DisclaimerDialogProps {
  onClose?: () => void;
  markdownContent?: string;
}

export const DisclaimerDialog = ({ markdownContent, onClose = () => {} }: DisclaimerDialogProps) => {
  const [open, setOpen] = useState(true);

  const { t } = useTranslation();

  const closeDialog = () => {
    setOpen(false);
    onClose();
  };

  const handleClose: DialogProps["onClose"] = (event: MouseEvent, reason: string) => {
    if (reason === "backdropClick") return; // prevents dialog close on backdropClick
    closeDialog();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <Stack sx={{ width: 500, borderRadius: 1 }}>
        <DialogHeaderContainer>
          <Stack direction="row">
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              {t("terms")}
            </Typography>
            <LanguagePopup />
          </Stack>
        </DialogHeaderContainer>
        <DialogMainContent>
          {markdownContent && <MarkdownWrapper markdownContent={markdownContent} />}
        </DialogMainContent>
        <DialogFooterContainer>
          <Stack direction="row" justifyContent="flex-end" alignItems="center">
            <AcceptButton onClick={closeDialog} />
          </Stack>
        </DialogFooterContainer>
      </Stack>
    </Dialog>
  );
};
