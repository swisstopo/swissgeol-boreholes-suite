import { FC, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import {
  Checkbox,
  Dialog,
  DialogProps,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Stack } from "@mui/system";
import { BoreholeAttachment } from "../../../../../api/apiInterfaces.ts";
import { useExtractStratigraphies, useFileInfo } from "../../../../../api/file/file.ts";
import { theme } from "../../../../../AppTheme.ts";
import { AlertContext } from "../../../../../components/alert/alertContext.tsx";
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

const getStratigraphyName = (file: BoreholeAttachment, index: number): string => {
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  return `Extracted_${baseName}_${index + 1}`;
};

export const StratigraphyExtractionDialog: FC<StratigraphyExtractionDialogProps> = ({
  file,
  setSelectedFile,
  open,
  setOpen,
}) => {
  const { t } = useTranslation();
  const { showAlert } = useContext(AlertContext);
  const [abortController, setAbortController] = useState<AbortController>();
  const { data: allExtractedStratigraphies = [], isLoading } = useExtractStratigraphies(file, 1);
  const { isLoading: isLoadingFileInfo } = useFileInfo(file?.id, 1);
  const { mutateAsync: bulkAdd } = useBulkAddMutation();
  const { id } = useRequiredParams<{ id: string }>();
  const { navigateTo } = useBoreholesNavigate();
  const location = useLocation();

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (allExtractedStratigraphies.length > 0) {
      setCheckedIndices(new Set(allExtractedStratigraphies.map((_, i) => i)));
    }
  }, [allExtractedStratigraphies, allExtractedStratigraphies.length]);

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

  const addStratigraphies = useCallback(async () => {
    const stratigraphiesToSave = [...checkedIndices]
      .sort((a, b) => a - b)
      .map(i => ({
        name: getStratigraphyName(file, i),
        lithologicalDescriptions: allExtractedStratigraphies[i].map(ld => ({ ...ld, id: 0 })),
      }));

    const results = await bulkAdd({ boreholeId: Number(id), stratigraphies: stratigraphiesToSave });
    showAlert(t("stratigraphySaved"), "success");
    closeDialog();
    navigateTo({
      path: `/${id}/stratigraphy/${results[0].stratigraphy.id}`,
      hash: location.hash,
    });
  }, [
    allExtractedStratigraphies,
    bulkAdd,
    checkedIndices,
    closeDialog,
    file,
    id,
    location.hash,
    navigateTo,
    showAlert,
    t,
  ]);

  const currentDescriptions = allExtractedStratigraphies[selectedIndex] ?? [];
  const hasMultiple = allExtractedStratigraphies.length > 1;

  return (
    <Dialog open={open} onClose={handleClose} fullScreen>
      <DialogHeaderContainer>
        <Stack direction="row" pt={0.5} alignItems="center" justifyContent={"space-between"} gap={2}>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            {t("extractStratigraphyFromProfile")}
          </Typography>
          {hasMultiple && (
            <ToggleButtonGroup
              value={selectedIndex}
              onChange={(_, value) => setSelectedIndex(value)}
              exclusive
              sx={{
                boxShadow: "none",
                border: `1px solid ${theme.palette.border.light}`,
              }}>
              {allExtractedStratigraphies.map((_, index) => (
                <ToggleButton
                  key={getStratigraphyName(file, index)}
                  value={index}
                  data-cy={`stratigraphy-toggle-item-${index}`}>
                  <Typography>{`${t("stratigraphy")} ${index + 1}`}</Typography>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
        </Stack>
      </DialogHeaderContainer>
      <DialogMainContent>
        <StratigraphyExtractionView
          file={file}
          lithologicalDescriptions={currentDescriptions}
          isLoading={isLoading || isLoadingFileInfo}
        />
      </DialogMainContent>
      <DialogFooterContainer>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <FormControlLabel
            control={<Checkbox data-cy={`add-stratigraphy-checkbox-${selectedIndex + 1}`} checked={false} />}
            label={`${t("stratigraphy")} ${selectedIndex + 1}`}
          />
          <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={0.75}>
            <CancelButton onClick={closeDialog} />
            <BoreholesButton
              dataCy="add-stratigraphy-button"
              disabled={checkedIndices.size === 0 || allExtractedStratigraphies.length === 0}
              variant="contained"
              color="primary"
              label={
                checkedIndices.size === 0 ? t("addStratigraphy") : t("addStratigraphy", { count: checkedIndices.size })
              }
              onClick={addStratigraphies}
            />
          </Stack>
        </Stack>
      </DialogFooterContainer>
    </Dialog>
  );
};
