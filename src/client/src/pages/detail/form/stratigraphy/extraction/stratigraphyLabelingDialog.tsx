import { FC, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogProps, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { BoreholeAttachment } from "../../../../../api/apiInterfaces.ts";
import { BoreholesButton, CancelButton } from "../../../../../components/buttons/buttons.tsx";
import {
  DialogFooterContainer,
  DialogHeaderContainer,
  DialogMainContent,
} from "../../../../../components/styledComponents.ts";
import { ExtractedStratigraphy } from "./extractedStratigraphy.tsx";

interface StratigraphyLabelingProps {
  file: BoreholeAttachment;
  setSelectedFile: (file: BoreholeAttachment | undefined) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const StratigraphyLabelingDialog: FC<StratigraphyLabelingProps> = ({ file, setSelectedFile, open, setOpen }) => {
  const { t } = useTranslation();
  const [abortController, setAbortController] = useState<AbortController>();

  const closeDialog = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(undefined);
    }
    setSelectedFile(undefined);
    setOpen(false);
  }, [abortController, setOpen, setSelectedFile]);

  const handleClose: DialogProps["onClose"] = (event: MouseEvent, reason: string) => {
    if (reason === "backdropClick") return; // prevents dialog close on backdropClick
    closeDialog();
  };

  const addStratigraphies = useCallback(() => {
    closeDialog();
  }, [closeDialog]);

  return (
    <Dialog open={open} onClose={handleClose} fullScreen>
      <DialogHeaderContainer>
        <Stack direction="row" pt={0.5}>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            {t("extractStratigraphyFromProfile")}
          </Typography>
        </Stack>
      </DialogHeaderContainer>
      <DialogMainContent>
        <ExtractedStratigraphy file={file} />
      </DialogMainContent>
      <DialogFooterContainer>
        <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={0.75}>
          <CancelButton onClick={closeDialog} />
          <BoreholesButton
            disabled={true}
            variant="contained"
            color="primary"
            label={t("addStratigraphy", { count: 1 })}
            onClick={addStratigraphies}
          />
        </Stack>
      </DialogFooterContainer>
    </Dialog>
  );
};
