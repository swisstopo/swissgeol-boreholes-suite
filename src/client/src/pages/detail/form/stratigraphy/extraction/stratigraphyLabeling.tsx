import { FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress, Dialog, DialogProps, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { BoreholeAttachment } from "../../../../../api/apiInterfaces.ts";
import { BoreholesButton, CancelButton } from "../../../../../components/buttons/buttons.tsx";
import {
  DialogFooterContainer,
  DialogHeaderContainer,
  DialogMainContent, FullPageCentered,
} from "../../../../../components/styledComponents.ts";
import {extractStratigraphies} from "../../../../../api/file/file.ts";

interface StratigraphyLabelingProps {
  file: BoreholeAttachment;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const StratigraphyLabeling: FC<StratigraphyLabelingProps> = ({ file, open, setOpen }) => {
  const { t } = useTranslation();
  const [extractionOnGoing, setExtractionOnGoing] = useState(false);
  const [abortController, setAbortController] = useState<AbortController>();

  const closeDialog = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(undefined);
    }
    setOpen(false);
  }, [abortController, setOpen]);

  const handleClose: DialogProps["onClose"] = (event: MouseEvent, reason: string) => {
    if (reason === "backdropClick") return; // prevents dialog close on backdropClick
    closeDialog();
  };

  const addStratigraphies = useCallback(() => {
    closeDialog();
  }, [closeDialog]);

  const handleExtractStratigraphies = useCallback(async () => {
    if (file) {
      setExtractionOnGoing(true);
      const abortController = new AbortController();
      setAbortController(abortController);
      const response = await extractStratigraphies(file.name, abortController.signal);
      console.log("Extracting stratigraphies from file:", response);
      setExtractionOnGoing(false);
      setAbortController(undefined);
    }
  }, [file]);

  useEffect(() => {
    if (file && !extractionOnGoing) {
      void handleExtractStratigraphies();
    }
  }, [handleExtractStratigraphies, extractionOnGoing, file]);

  return (
    <Dialog open={open} onClose={handleClose} fullScreen>
      <DialogHeaderContainer>
        <Stack direction="row">
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            {t("extractStratigraphyFromProfile")}
          </Typography>
        </Stack>
      </DialogHeaderContainer>
      <DialogMainContent>
        {extractionOnGoing ? (
          <FullPageCentered sx={{ height: "100%" }}>
            <CircularProgress />
          </FullPageCentered>
        ) : (
          <Stack direction="row"></Stack>
        )}
        <Stack></Stack>
      </DialogMainContent>
      <DialogFooterContainer>
        <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={0.75}>
          <CancelButton onClick={closeDialog} />
          <BoreholesButton
            variant="contained"
            color="primary"
            label={t("extractStratigraphy", { count: 1 })}
            onClick={addStratigraphies}
          />
        </Stack>
      </DialogFooterContainer>
    </Dialog>
  );
};
