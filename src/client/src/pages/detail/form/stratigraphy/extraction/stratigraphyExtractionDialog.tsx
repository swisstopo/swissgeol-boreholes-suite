import { FC, MouseEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
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
import { ApiError, BoreholeAttachment } from "../../../../../api/apiInterfaces.ts";
import { useExtractStratigraphies, useFileInfo } from "../../../../../api/dataextraction.ts";
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
import { prepareDataForSubmit } from "../components/lithologyTable/lithologyTableUtils.ts";
import { useAddExtractedStratigraphies } from "../stratigraphy.ts";
import { StratigraphyExtractionItemState } from "./stratigraphyExtractionItem.tsx";
import { StratigraphyExtractionView } from "./stratigraphyExtractionView.tsx";

interface StratigraphyExtractionDialogProps {
  file: BoreholeAttachment;
  setSelectedFile: (file: BoreholeAttachment | undefined) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const getBaseName = (file: BoreholeAttachment): string => (file.name ?? "").replace(/\.[^/.]+$/, "");
const getDefaultStratigraphyName = (file: BoreholeAttachment, index: number, count: number): string =>
  count === 1 ? getBaseName(file) : `${getBaseName(file)}_${index + 1}`;

export const StratigraphyExtractionDialog: FC<StratigraphyExtractionDialogProps> = ({
  file,
  setSelectedFile,
  open,
  setOpen,
}) => {
  const { t } = useTranslation();
  const { showAlert } = useContext(AlertContext);
  const [abortController, setAbortController] = useState<AbortController>();
  const { data: allExtractedStratigraphies = [], isLoading: isLoadingExtraction } = useExtractStratigraphies(file, 1);
  const { isLoading: isLoadingFileInfo } = useFileInfo(file?.id, 1);
  const { mutateAsync: bulkAdd, isPending: isLoadingBulkAdd } = useAddExtractedStratigraphies();
  const { id } = useRequiredParams<{ id: string }>();
  const { navigateTo } = useBoreholesNavigate();
  const location = useLocation();
  const [activePage, setActivePage] = useState<number>(1);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());
  const [itemStates, setItemStates] = useState<Map<number, StratigraphyExtractionItemState>>(new Map());
  const [names, setNames] = useState<Map<number, string>>(new Map());
  const [conflictingNames, setConflictingNames] = useState<Set<string>>(new Set());
  const initializedFileRef = useRef<string | undefined>(undefined);

  const handleItemStateChange = useCallback((index: number, state: StratigraphyExtractionItemState) => {
    setItemStates(prev => {
      const next = new Map(prev);
      next.set(index, state);
      return next;
    });
  }, []);

  useEffect(() => {
    // Auto-check the only stratigraphy when there is exactly one
    if (allExtractedStratigraphies.length === 1 && !checkedIndices.has(0)) {
      setCheckedIndices(new Set([0]));
    }
  }, [allExtractedStratigraphies.length, checkedIndices]);

  useEffect(() => {
    // Prefill the editable names once the extraction result is available (once per file).
    if (allExtractedStratigraphies.length === 0 || initializedFileRef.current === file.name) return;
    initializedFileRef.current = file.name;
    const count = allExtractedStratigraphies.length;
    setNames(
      new Map(allExtractedStratigraphies.map((_, index) => [index, getDefaultStratigraphyName(file, index, count)])),
    );
  }, [allExtractedStratigraphies, file]);

  const setName = useCallback((index: number, value: string) => {
    setNames(prev => {
      const next = new Map(prev);
      next.set(index, value);
      return next;
    });
    // Editing any name invalidates a previous server-side uniqueness result.
    setConflictingNames(new Set());
  }, []);

  // Per-stratigraphy name validation, scoped to the stratigraphies that will be imported (checked):
  // empty names, duplicates within the batch, and names the server reported as conflicting.
  const nameErrors = useMemo(() => {
    const errors = new Map<number, string>();
    const checked = [...checkedIndices].filter(i => i >= 0 && i < allExtractedStratigraphies.length);
    const trimmedByIndex = new Map(checked.map(i => [i, (names.get(i) ?? "").trim()]));
    for (const i of checked) {
      const name = trimmedByIndex.get(i)!;
      if (name === "") {
        errors.set(i, t("required"));
      } else if (checked.some(j => j !== i && trimmedByIndex.get(j) === name)) {
        errors.set(i, t("mustBeUnique"));
      } else if (conflictingNames.has(name)) {
        errors.set(i, t("mustBeUnique"));
      }
    }
    return errors;
  }, [checkedIndices, names, conflictingNames, allExtractedStratigraphies.length, t]);

  const hasNameErrors = nameErrors.size > 0;

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
    setNames(new Map());
    setConflictingNames(new Set());
    initializedFileRef.current = undefined;
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

    const stratigraphiesToSave = validIndices.map(i => {
      const itemState = itemStates.get(i);
      return {
        name: (names.get(i) ?? "").trim(),
        lithologicalDescriptions: (itemState?.tmpLithologicalDescriptions ?? []).map(prepareDataForSubmit),
        lithologies: (itemState?.tmpLithologies ?? []).map(prepareDataForSubmit),
      };
    });

    try {
      const results = await bulkAdd({ boreholeId: Number(id), stratigraphies: stratigraphiesToSave });

      if (!results || results.length === 0) {
        showAlert(t("errorStratigraphySaving"), "error");
        return;
      }

      closeDialog();
      navigateTo({
        path: `/${id}/stratigraphy/${results[0].stratigraphy.id}`,
        hash: location.hash,
      });
    } catch (error) {
      if (error instanceof ApiError && error.messageKey === "mustBeUnique") {
        // Flag the offending name fields and jump to the first conflicting stratigraphy.
        const conflicts = (error.details?.conflictingNames ?? []) as string[];
        setConflictingNames(new Set(conflicts));
        const firstConflict = validIndices.find(i => conflicts.includes((names.get(i) ?? "").trim()));
        if (firstConflict !== undefined) {
          setSelectedIndex(firstConflict);
          setActivePage(allExtractedStratigraphies[firstConflict]?.pageNumbers[0] ?? 1);
        }
      } else {
        showAlert(t("errorStratigraphySaving"), "error");
      }
    }
  }, [
    allExtractedStratigraphies,
    bulkAdd,
    checkedIndices,
    closeDialog,
    id,
    itemStates,
    location.hash,
    names,
    navigateTo,
    showAlert,
    t,
  ]);

  const hasMultiple = allExtractedStratigraphies.length > 1;
  const useDropdown = allExtractedStratigraphies.length > 3;
  const hasErrorsInChecked = [...checkedIndices].some(i => itemStates.get(i)?.hasErrors === true);

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
              {allExtractedStratigraphies.map((stratigraphy, index) => (
                <ToggleButton
                  key={`stratigraphy-toggle-${stratigraphy.pageNumbers.join("-")}`}
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
              {allExtractedStratigraphies.map((stratigraphy, index) => (
                <MenuItem
                  key={`stratigraphy-select-${stratigraphy.pageNumbers.join("-")}`}
                  value={index}
                  data-cy={`stratigraphy-select-item-${index}`}>
                  {`${t("stratigraphy")} ${index + 1}`}
                </MenuItem>
              ))}
            </Select>
          )}
        </Stack>
      </DialogHeaderContainer>
      <DialogMainContent sx={{ padding: 0 }}>
        <StratigraphyExtractionView
          file={file}
          activePage={activePage}
          setActivePage={setActivePage}
          allExtractedStratigraphies={allExtractedStratigraphies}
          selectedIndex={selectedIndex}
          onItemStateChange={handleItemStateChange}
          isLoading={isLoadingExtraction || isLoadingFileInfo}
          names={names}
          nameErrors={nameErrors}
          onNameChange={setName}
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
            label={t("applyStratigraphy", { number: selectedIndex + 1 })}
          />
          <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={0.75}>
            <CancelButton onClick={closeDialog} />
            <BoreholesButton
              dataCy="add-stratigraphy-button"
              disabled={
                checkedIndices.size === 0 ||
                allExtractedStratigraphies.length === 0 ||
                isLoadingBulkAdd ||
                hasErrorsInChecked ||
                hasNameErrors
              }
              variant="contained"
              color="primary"
              label={t("addStratigraphy", { count: Math.max(checkedIndices.size, 1) })}
              onClick={addStratigraphies}
            />
          </Stack>
        </Stack>
      </DialogFooterContainer>
    </Dialog>
  );
};
