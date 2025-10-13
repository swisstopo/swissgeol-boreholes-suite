import { FC, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { Dialog, DialogProps, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { BoreholeAttachment } from "../../../../../api/apiInterfaces.ts";
import { useExtractStratigraphies } from "../../../../../api/file/file.ts";
import { BoreholesButton, CancelButton } from "../../../../../components/buttons/buttons.tsx";
import {
  DialogFooterContainer,
  DialogHeaderContainer,
  DialogMainContent,
} from "../../../../../components/styledComponents.ts";
import { useBoreholesNavigate } from "../../../../../hooks/useBoreholesNavigate.tsx";
import { useRequiredParams } from "../../../../../hooks/useRequiredParams.ts";
import { StratigraphyExtractionView } from "./stratigraphyExtractionView.tsx";
import { useBulkAddMutation } from "./useBulkAddMutations.ts";

interface StratigraphyExtractionDialogProps {
  file: BoreholeAttachment;
  setSelectedFile: (file: BoreholeAttachment | undefined) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const StratigraphyExtractionDialog: FC<StratigraphyExtractionDialogProps> = ({
  file,
  setSelectedFile,
  open,
  setOpen,
}) => {
  const { t } = useTranslation();
  const [abortController, setAbortController] = useState<AbortController>();
  const { data: lithologicalDescriptions = [], isLoading } = useExtractStratigraphies(file);
  const { mutateAsync: bulkAddLithologicalDescriptionsWithLithologies } = useBulkAddMutation();
  const { id } = useRequiredParams<{ id: string }>();
  const { navigateTo } = useBoreholesNavigate();
  const location = useLocation();

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

  const addStratigraphy = useCallback(async () => {
    const bulkAddResult = await bulkAddLithologicalDescriptionsWithLithologies({
      boreholeId: Number(id),
      lithologicalDescriptions: lithologicalDescriptions.map(ld => ({ ...ld, id: 0 })),
    });
    closeDialog();
    navigateTo({
      path: `/${id}/stratigraphy/${bulkAddResult.stratigraphy.id}`,
      hash: location.hash,
    });
  }, [
    bulkAddLithologicalDescriptionsWithLithologies,
    closeDialog,
    id,
    lithologicalDescriptions,
    location.hash,
    navigateTo,
  ]);

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
        <StratigraphyExtractionView
          file={file}
          lithologicalDescriptions={lithologicalDescriptions}
          isLoading={isLoading}
        />
      </DialogMainContent>
      <DialogFooterContainer>
        <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={0.75}>
          <CancelButton onClick={closeDialog} />
          <BoreholesButton
            disabled={lithologicalDescriptions?.length < 1}
            variant="contained"
            color="primary"
            label={t("addStratigraphy", { count: 1 })}
            onClick={addStratigraphy}
          />
        </Stack>
      </DialogFooterContainer>
    </Dialog>
  );
};
