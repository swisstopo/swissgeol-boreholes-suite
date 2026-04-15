import { FC, MouseEvent, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import {
  Checkbox,
  Dialog,
  DialogProps,
  FormControlLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
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
  return `${baseName}_${index + 1}`;
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
  const [activePage, setActivePage] = useState<number>(1);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Auto-check the only stratigraphy when there is exactly one
    if (allExtractedStratigraphies.length === 1 && !checkedIndices.has(0)) {
      setCheckedIndices(new Set([0]));
    }
  }, [allExtractedStratigraphies.length, checkedIndices]);

  const setSelectedIndexAndPage = (value: number) => {
    setSelectedIndex(value);
    setActivePage(allExtractedStratigraphies[value]?.pageNumbers[0] ?? 1);
  };

  const handleStratigraphyToggleChange = (_: MouseEvent, value: number | null) => {
    if (value === null) return;
    setSelectedIndexAndPage(value);
  };

  const handleStratigraphySelectChange = (event: SelectChangeEvent<number>) => {
    const value = Number(event.target.value);
    setSelectedIndexAndPage(value);
  };

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
    const validIndices = [...checkedIndices]
      .filter(i => i >= 0 && i < allExtractedStratigraphies.length)
      .sort((a, b) => a - b);

    if (validIndices.length === 0) {
      showAlert(t("errorStratigraphySaving"), "error");
      return;
    }

    const stratigraphiesToSave = validIndices.map(i => ({
      name: getStratigraphyName(file, i),
      lithologicalDescriptions: allExtractedStratigraphies[i].descriptions.map(ld => ({ ...ld, id: 0 })),
    }));

    const results = await bulkAdd({ boreholeId: Number(id), stratigraphies: stratigraphiesToSave });

    if (!results || results.length === 0) {
      showAlert(t("errorStratigraphySaving"), "error");
      return;
    }

    showAlert(t("stratigraphySaved", { count: validIndices.length }), "success");
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

  const currentDescriptions = allExtractedStratigraphies[selectedIndex]?.descriptions ?? [];
  const hasMultiple = allExtractedStratigraphies.length > 1;
  const useDropdown = allExtractedStratigraphies.length > 3;

  return (
    <Dialog open={open} onClose={handleClose} fullScreen>
      <DialogHeaderContainer>
        <Stack
          direction="row"
          pt={0.5}
          alignItems="center"
          justifyContent={"space-between"}
          gap={2}
          sx={{ width: "100%" }}>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            {t("extractStratigraphyFromProfile")}
          </Typography>
          {hasMultiple && !useDropdown && (
            <ToggleButtonGroup
              value={selectedIndex}
              onChange={handleStratigraphyToggleChange}
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
          {useDropdown && (
            <Select
              value={selectedIndex}
              onChange={handleStratigraphySelectChange}
              data-cy="stratigraphy-select"
              size="small"
              sx={{
                minWidth: 200,
                backgroundColor: theme.palette.background.default,
              }}>
              {allExtractedStratigraphies.map((_, index) => (
                <MenuItem
                  key={getStratigraphyName(file, index)}
                  value={index}
                  data-cy={`stratigraphy-select-item-${index}`}>
                  {`${t("stratigraphy")} ${index + 1}`}
                </MenuItem>
              ))}
            </Select>
          )}
        </Stack>
      </DialogHeaderContainer>
      <DialogMainContent>
        <StratigraphyExtractionView
          file={file}
          activePage={activePage}
          setActivePage={setActivePage}
          lithologicalDescriptions={currentDescriptions}
          isLoading={isLoading || isLoadingFileInfo}
          currentPageRange={allExtractedStratigraphies[selectedIndex]?.pageNumbers}
        />
      </DialogMainContent>
      <DialogFooterContainer>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
          <FormControlLabel
            sx={{ visibility: hasMultiple ? "visible" : "hidden" }}
            control={
              <Checkbox
                data-cy={`add-stratigraphy-checkbox-${selectedIndex + 1}`}
                checked={checkedIndices.has(selectedIndex)}
                onChange={(_, checked) => {
                  setCheckedIndices(prev => {
                    const next = new Set(prev);
                    if (checked) {
                      next.add(selectedIndex);
                    } else {
                      next.delete(selectedIndex);
                    }
                    return next;
                  });
                }}
              />
            }
            label={t("addStratigraphyNumber", { number: selectedIndex + 1 })}
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
