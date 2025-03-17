import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Dialog, DialogProps, Stack, Typography } from "@mui/material";
import { AcceptButton } from "../components/buttons/buttons.tsx";
import { FormCheckbox, FormContainer } from "../components/form/form";
import { LanguagePopup } from "../components/header/languagePopup.tsx";
import { DialogFooterContainer, DialogHeaderContainer, DialogMainContent } from "../components/styledComponents.ts";
import { MarkdownWrapper } from "./markdownWrapper.tsx";

interface DisclaimerDialogProps {
  markdownContent?: string;
  onClose?: (analyticsEnabled: boolean) => void;
}

export const DisclaimerDialog = ({ markdownContent, onClose = () => {} }: DisclaimerDialogProps) => {
  const [open, setOpen] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const { t } = useTranslation();
  const formMethods = useForm({ mode: "all" });

  const closeDialog = () => {
    setOpen(false);
    onClose(analyticsEnabled);
  };

  const handleClose: DialogProps["onClose"] = (event: MouseEvent, reason: string) => {
    if (reason === "backdropClick") return; // prevents dialog close on backdropClick
    closeDialog();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      PaperProps={{
        sx: {
          width: 700,
          maxWidth: "none",
        },
      }}
    >
      <Stack sx={{ width: "100%", borderRadius: 1 }}>
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
          <FormProvider {...formMethods}>
            <FormContainer>
              <FormCheckbox
                fieldName="dataCollectionConsent"
                label="dataCollectionConsent"
                checked={analyticsEnabled}
                onChange={setAnalyticsEnabled}
              />
            </FormContainer>
          </FormProvider>
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
