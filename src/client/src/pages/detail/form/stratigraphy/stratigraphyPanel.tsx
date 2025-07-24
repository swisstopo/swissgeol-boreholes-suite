import { FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Box, Card, Chip, CircularProgress, Stack, Tooltip, Typography } from "@mui/material";
import { Trash2 } from "lucide-react";
import CopyIcon from "../../../../assets/icons/copy.svg?react";
import ExtractAiIcon from "../../../../assets/icons/extractAi.svg?react";
import { useReloadBoreholes } from "../../../../api/borehole.ts";
import {
  Stratigraphy,
  useReloadStratigraphies,
  useStratigraphiesByBoreholeId,
  useStratigraphyMutations,
} from "../../../../api/stratigraphy";
import { theme } from "../../../../AppTheme";
import { AddButton, BoreholesButton, DeleteButton } from "../../../../components/buttons/buttons";
import { FormValueType } from "../../../../components/form/form";
import { FormCheckbox } from "../../../../components/form/formCheckbox";
import { FormContainer } from "../../../../components/form/formContainer";
import { FormInput } from "../../../../components/form/formInput";
import { ensureDatetime } from "../../../../components/form/formUtils";
import { useFormDirtyChanges } from "../../../../components/form/useFormDirtyChanges";
import { PromptContext } from "../../../../components/prompt/promptContext";
import { FullPageCentered } from "../../../../components/styledComponents";
import { BoreholeTab, BoreholeTabContentBox, BoreholeTabs } from "../../../../components/styledTabComponents";
import { useBlockNavigation } from "../../../../hooks/useBlockNavigation";
import { useBoreholesNavigate } from "../../../../hooks/useBoreholesNavigate";
import { useRequiredParams } from "../../../../hooks/useRequiredParams";
import { useApiErrorAlert } from "../../../../hooks/useShowAlertOnError.tsx";
import { formatDate } from "../../../../utils";
import { EditStateContext } from "../../editStateContext";
import { SaveContext, SaveContextProps } from "../../saveContext";
import { AddStratigraphyButton } from "./addStratigraphyButton";

export const StratigraphyPanel: FC = () => {
  const { id: boreholeId, stratigraphyId } = useRequiredParams();
  const { navigateTo } = useBoreholesNavigate();
  const location = useLocation();
  const { data: stratigraphies } = useStratigraphiesByBoreholeId(Number(boreholeId));
  const {
    add: { mutate: addStratigraphy },
    copy: { mutate: copyStratigraphy },
    update: { mutate: updateStratigraphy },
    delete: { mutate: deleteStratigraphy },
  } = useStratigraphyMutations();
  const reloadStratigraphies = useReloadStratigraphies();
  const reloadBoreholes = useReloadBoreholes();
  const { editingEnabled } = useContext(EditStateContext);
  const { t } = useTranslation();
  const { hasChanges, registerSaveHandler, registerResetHandler, unMount } = useContext<SaveContextProps>(SaveContext);
  useBlockNavigation();
  const formMethods = useForm<Stratigraphy>({ mode: "all" });
  const { formState, getValues } = formMethods;
  useFormDirtyChanges({ formState });
  const { showPrompt } = useContext(PromptContext);
  const showApiErrorAlert = useApiErrorAlert();
  const [newlyAddedStratigraphyId, setNewlyAddedStratigraphyId] = useState<number>();

  const sortedStratigraphies: Stratigraphy[] | undefined = useMemo(() => {
    if (!stratigraphies) return stratigraphies;
    const existingStratigraphies = [...stratigraphies].sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      return (a.name || "").localeCompare(b.name || "");
    });
    if (stratigraphyId === "new") {
      return [
        ...existingStratigraphies,
        {
          id: 0,
          boreholeId: Number(boreholeId),
          borehole: null,
          isPrimary: !stratigraphies?.length,
          date: null,
          created: null,
          createdById: null,
          updated: null,
          updatedById: null,
          name: "",
          layers: null,
          chronostratigraphyLayers: null,
          lithostratigraphyLayers: null,
        },
      ];
    }
    return existingStratigraphies;
  }, [boreholeId, stratigraphies, stratigraphyId]);

  useEffect(() => {
    if (
      sortedStratigraphies?.length &&
      (stratigraphyId === undefined ||
        (stratigraphyId !== "new" && !sortedStratigraphies.some(x => x.id === Number(stratigraphyId))))
    ) {
      const primaryId = sortedStratigraphies.find(x => x.isPrimary)?.id ?? sortedStratigraphies[0].id ?? -1;
      navigateTo({
        path: primaryId === -1 ? `/${boreholeId}/stratigraphy` : `/${boreholeId}/stratigraphy/${primaryId}`,
        replace: true,
      });
    }
  }, [boreholeId, navigateTo, stratigraphyId, sortedStratigraphies]);

  const selectedTabIndex: number = useMemo(
    () => sortedStratigraphies?.findIndex(x => x.id === (stratigraphyId === "new" ? 0 : Number(stratigraphyId))) ?? -1,
    [sortedStratigraphies, stratigraphyId],
  );

  const hasSelectedTab = selectedTabIndex !== -1;

  const selectedStratigraphy: Stratigraphy | undefined = useMemo(
    () => (hasSelectedTab ? sortedStratigraphies?.[selectedTabIndex] : undefined),
    [hasSelectedTab, sortedStratigraphies, selectedTabIndex],
  );

  const navigateToStratigraphy = useCallback(
    (stratigraphyId: number, replace = false) => {
      navigateTo({
        path: `/${boreholeId}/stratigraphy/${stratigraphyId === 0 ? "new" : stratigraphyId}`,
        hash: location.hash,
        replace,
      });
    },
    [location.hash, navigateTo, boreholeId],
  );

  const switchTab = useCallback(
    (newIndex: number) => {
      if (sortedStratigraphies && newIndex >= 0 && newIndex < sortedStratigraphies.length) {
        const newStratigraphy = sortedStratigraphies[newIndex];
        navigateToStratigraphy(newStratigraphy.id);
      }
    },
    [sortedStratigraphies, navigateToStratigraphy],
  );

  const extractStratigraphyFromProfile = useCallback(() => {}, []);

  const addEmptyStratigraphy = useCallback(async () => {
    navigateToStratigraphy(0);
  }, [navigateToStratigraphy]);

  const deleteSelectedStratigraphy = useCallback(async () => {
    if (!selectedStratigraphy) return;
    deleteStratigraphy(selectedStratigraphy, {
      onSuccess: () => {
        navigateTo({ path: `/${boreholeId}/stratigraphy` });
        reloadStratigraphies(Number(boreholeId));
        reloadBoreholes();
      },
    });
  }, [boreholeId, deleteStratigraphy, navigateTo, reloadBoreholes, reloadStratigraphies, selectedStratigraphy]);

  const onCopy = useCallback(() => {
    if (selectedStratigraphy) {
      copyStratigraphy(selectedStratigraphy, {
        onSuccess: newStratigraphyId => {
          navigateToStratigraphy(newStratigraphyId);
          reloadStratigraphies(Number(boreholeId));
        },
      });
    }
  }, [boreholeId, copyStratigraphy, navigateToStratigraphy, reloadStratigraphies, selectedStratigraphy]);

  const resetWithoutSave = useCallback(() => {
    if (selectedStratigraphy) {
      formMethods.reset({
        ...selectedStratigraphy,
        date: selectedStratigraphy.date?.toString().slice(0, 10) ?? "",
      });
    }
  }, [formMethods, selectedStratigraphy]);

  const handleSaveError = useCallback(
    (error: Error) => {
      if (error.message.includes("Name must be unique")) {
        formMethods.setError("name", { type: "manual", message: t("mustBeUnique") });
      } else {
        showApiErrorAlert(error);
      }

      return false;
    },
    [formMethods, showApiErrorAlert, t],
  );

  const onSave = useCallback(async () => {
    if (selectedStratigraphy) {
      const values = getValues();
      values.date = values.date ? ensureDatetime(values.date.toString()) : null;

      try {
        if (values.id === 0) {
          await new Promise<void>((resolve, reject) => {
            addStratigraphy(values, {
              onSuccess: newStratigraphy => {
                setNewlyAddedStratigraphyId(newStratigraphy.id);
                resolve();
              },
              onError: error => {
                handleSaveError(error);
                reject(error);
              },
            });
          });
        } else {
          await new Promise<void>((resolve, reject) => {
            updateStratigraphy(
              { ...selectedStratigraphy, ...values },
              {
                onSuccess: () => {
                  reloadStratigraphies(Number(boreholeId));
                  resolve();
                },
                onError: error => {
                  handleSaveError(error);
                  reject(error);
                },
              },
            );
          });
        }
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, [
    addStratigraphy,
    boreholeId,
    getValues,
    handleSaveError,
    reloadStratigraphies,
    selectedStratigraphy,
    updateStratigraphy,
  ]);

  const showDeletePrompt = useCallback(() => {
    if (!selectedStratigraphy) return;

    showPrompt("deleteMessage", [
      {
        label: "cancel",
      },
      {
        label: "delete",
        icon: <Trash2 />,
        variant: "contained",
        action: deleteSelectedStratigraphy,
      },
    ]);
  }, [deleteSelectedStratigraphy, selectedStratigraphy, showPrompt]);

  useEffect(() => {
    if (!hasChanges && newlyAddedStratigraphyId) {
      navigateToStratigraphy(newlyAddedStratigraphyId, true);
      reloadStratigraphies(Number(boreholeId));
      setNewlyAddedStratigraphyId(undefined);
    }
  }, [boreholeId, hasChanges, navigateToStratigraphy, newlyAddedStratigraphyId, reloadStratigraphies]);

  useEffect(() => {
    registerSaveHandler(onSave);
    registerResetHandler(resetWithoutSave);

    return () => {
      unMount();
    };
  }, [registerResetHandler, registerSaveHandler, resetWithoutSave, onSave, unMount]);

  useEffect(() => {
    resetWithoutSave();
  }, [resetWithoutSave]);

  if (!sortedStratigraphies) {
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );
  } else if (sortedStratigraphies.length === 0) {
    return (
      <Card sx={{ p: 4 }}>
        <Typography>{t("noStratigraphy")}</Typography>
        {editingEnabled && (
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <AddButton label="addEmptyStratigraphy" variant="contained" onClick={addEmptyStratigraphy} />
            <BoreholesButton
              label="extractStratigraphyFromProfile"
              variant="contained"
              disabled
              icon={<ExtractAiIcon />}
              onClick={extractStratigraphyFromProfile}
            />
          </Stack>
        )}
      </Card>
    );
  }

  if (selectedStratigraphy) {
    return (
      <Box>
        <Box sx={{ position: "relative" }}>
          {sortedStratigraphies.length === 1 ? (
            <Stack
              data-cy="stratigraphy-header"
              direction="row"
              sx={{
                backgroundColor: "background.header",
                borderTopLeftRadius: "4px",
                borderTopRightRadius: "4px",
                border: `1px solid ${theme.palette.border.light}`,
                borderBottom: "none",
                alignItems: "center",
                justifyContent: "space-between",
                p: 3,
              }}>
              <Typography variant="h5" ml={"11px"}>
                {selectedStratigraphy.name}
              </Typography>
              <Stack direction="row" gap={0.75}>
                {editingEnabled ? (
                  <>
                    {selectedStratigraphy.id !== 0 && (
                      <>
                        <DeleteButton onClick={showDeletePrompt} />
                        <BoreholesButton
                          variant="outlined"
                          color={"secondary"}
                          label={"duplicate"}
                          onClick={onCopy}
                          icon={<CopyIcon />}
                        />
                      </>
                    )}
                    <AddStratigraphyButton
                      addEmptyStratigraphy={addEmptyStratigraphy}
                      extractStratigraphyFromProfile={extractStratigraphyFromProfile}
                    />
                  </>
                ) : (
                  selectedStratigraphy.date && <Chip color="info" label={formatDate(selectedStratigraphy.date)} />
                )}
              </Stack>
            </Stack>
          ) : (
            <>
              <BoreholeTabs
                value={selectedTabIndex === -1 ? 0 : selectedTabIndex}
                onChange={(_, newValue) => switchTab(newValue)}>
                {sortedStratigraphies.map(stratigraphy => (
                  <BoreholeTab
                    data-cy={`stratigraphy-tab-${stratigraphy.id}`}
                    key={String(stratigraphy.id)}
                    label={stratigraphy.name || t("np")}
                    hasContent
                  />
                ))}
              </BoreholeTabs>
              {editingEnabled && (
                <AddStratigraphyButton
                  addEmptyStratigraphy={addEmptyStratigraphy}
                  extractStratigraphyFromProfile={extractStratigraphyFromProfile}
                  sx={{ position: "absolute", top: 0, right: 0, mx: 2, my: 1 }}
                />
              )}
            </>
          )}
          <BoreholeTabContentBox
            p={3}
            pt={2.25}
            gap={3}
            sx={{
              borderBottomLeftRadius: "4px",
              borderBottomRightRadius: "4px",
            }}>
            {sortedStratigraphies.length > 1 && editingEnabled && selectedStratigraphy.id !== 0 && (
              <Stack direction="row" gap={0.75} justifyContent="flex-end">
                {selectedStratigraphy.isPrimary ? (
                  <Tooltip title={t("deleteMainStratigraphy")}>
                    <span>
                      <DeleteButton onClick={showDeletePrompt} disabled={selectedStratigraphy.isPrimary} />
                    </span>
                  </Tooltip>
                ) : (
                  <DeleteButton onClick={showDeletePrompt} />
                )}
                <BoreholesButton
                  variant="outlined"
                  color={"secondary"}
                  label={"duplicate"}
                  onClick={onCopy}
                  icon={<CopyIcon />}
                />
              </Stack>
            )}
            {editingEnabled && (
              <FormProvider {...formMethods}>
                <FormContainer direction={"row"}>
                  <FormInput
                    fieldName={"name"}
                    label={"stratigraphy_name"}
                    value={selectedStratigraphy.name}
                    type={FormValueType.Text}
                    required={true}
                    onUpdate={() => formMethods.clearErrors("name")}
                  />
                  <FormInput
                    fieldName={"date"}
                    label="date"
                    value={selectedStratigraphy.date?.toString().slice(0, 10) ?? ""}
                    type={FormValueType.Date}
                  />
                  {sortedStratigraphies.length > 1 && (
                    <FormCheckbox
                      fieldName={"isPrimary"}
                      label={"mainStratigraphy"}
                      disabled={selectedStratigraphy.isPrimary}
                    />
                  )}
                </FormContainer>
              </FormProvider>
            )}
            <Box sx={{ position: "relative" }}>
              {sortedStratigraphies.length > 1 && !editingEnabled && (
                <Stack
                  direction="row"
                  gap={0.75}
                  justifyContent="flex-end"
                  sx={{ position: "absolute", top: 0, right: 0, mx: 2, my: 1 }}>
                  {selectedStratigraphy.isPrimary && <Chip color="info" label={t("mainStratigraphy")} />}
                  {selectedStratigraphy.date && <Chip color="info" label={formatDate(selectedStratigraphy.date)} />}
                </Stack>
              )}
            </Box>
          </BoreholeTabContentBox>
        </Box>
      </Box>
    );
  }

  return <Box />;
};
