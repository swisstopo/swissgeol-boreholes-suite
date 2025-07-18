import { FC, useCallback, useContext, useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Box, Card, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { Trash2 } from "lucide-react";
import CopyIcon from "../../../../assets/icons/copy.svg?react";
import ExtractAiIcon from "../../../../assets/icons/extractAi.svg?react";
import { Stratigraphy, useStratigraphiesByBoreholeId, useStratigraphyMutations } from "../../../../api/stratigraphy.ts";
import { theme } from "../../../../AppTheme.ts";
import { AddButton, BoreholesButton, DeleteButton } from "../../../../components/buttons/buttons.tsx";
import { FormValueType } from "../../../../components/form/form.ts";
import { FormCheckbox } from "../../../../components/form/formCheckbox.tsx";
import { FormContainer } from "../../../../components/form/formContainer.tsx";
import { FormInput } from "../../../../components/form/formInput.tsx";
import { ensureDatetime } from "../../../../components/form/formUtils.ts";
import { useFormDirtyChanges } from "../../../../components/form/useFormDirtyChanges.tsx";
import { PromptContext } from "../../../../components/prompt/promptContext.tsx";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { BoreholeTab, BoreholeTabContentBox, BoreholeTabs } from "../../../../components/styledTabComponents.tsx";
import { TabPanel } from "../../../../components/tabs/tabPanel.tsx";
import { useBlockNavigation } from "../../../../hooks/useBlockNavigation.tsx";
import { useBoreholesNavigate } from "../../../../hooks/useBoreholesNavigate.tsx";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { formatDate } from "../../../../utils.ts";
import { EditStateContext } from "../../editStateContext.tsx";
import { SaveContext, SaveContextProps } from "../../saveContext.tsx";
import { AddStratigraphyButton } from "./addStratigraphyButton.tsx";
import ChronostratigraphyPanel from "./chronostratigraphy/chronostratigraphyPanel.jsx";
import { Lithology } from "./lithology/lithology.tsx";
import LithostratigraphyPanel from "./lithostratigraphy/lithostratigraphyPanel.jsx";

export const StratigraphyPanel: FC = () => {
  const { id: boreholeId, stratigraphyId } = useRequiredParams();
  const { navigateTo } = useBoreholesNavigate();
  const location = useLocation();
  const { data: stratigraphies } = useStratigraphiesByBoreholeId(Number(boreholeId));
  const {
    add: { mutateAsync: addStratigraphyAsync },
    copy: { mutate: copyStratigraphy },
    update: { mutate: updateStratigraphy },
    delete: { mutate: deleteStratigraphy },
  } = useStratigraphyMutations();
  const { editingEnabled } = useContext(EditStateContext);
  const { t } = useTranslation();
  const { registerSaveHandler, registerResetHandler, unMount } = useContext<SaveContextProps>(SaveContext);
  useBlockNavigation();
  const formMethods = useForm<Stratigraphy>({ mode: "all" });
  const { formState, getValues } = formMethods;
  useFormDirtyChanges({ formState });
  const { showPrompt } = useContext(PromptContext);

  const sortedStratigraphies = useMemo(() => {
    if (!stratigraphies) return stratigraphies;
    return [...stratigraphies].sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [stratigraphies]);

  const selectedTabIndex = useMemo(
    () => sortedStratigraphies?.findIndex(x => x.id === Number(stratigraphyId)) ?? -1,
    [sortedStratigraphies, stratigraphyId],
  );

  const hasSelectedTab = selectedTabIndex !== -1;

  const selectedStratigraphy = useMemo(
    () => (hasSelectedTab ? sortedStratigraphies?.[selectedTabIndex] : undefined),
    [hasSelectedTab, sortedStratigraphies, selectedTabIndex],
  );

  const navigateToStratigraphy = useCallback(
    (stratigraphyId: number, replace = false) => {
      navigateTo({
        path: `/${boreholeId}/stratigraphy/${stratigraphyId}`,
        hash: location.hash,
        replace: replace,
      });
    },
    [location.hash, navigateTo, boreholeId],
  );

  const addEmptyStratigraphy = useCallback(async () => {
    const stratigraphy = await addStratigraphyAsync(Number(boreholeId));
    navigateToStratigraphy(stratigraphy.id);
  }, [addStratigraphyAsync, boreholeId, navigateToStratigraphy]);

  const extractStratigraphyFromProfile = useCallback(() => {}, []);

  const resetWithoutSave = useCallback(() => {
    if (selectedStratigraphy) {
      formMethods.reset({
        ...selectedStratigraphy,
        date: selectedStratigraphy.date?.toString().slice(0, 10) ?? "",
      });
    }
  }, [formMethods, selectedStratigraphy]);

  const onSave = useCallback(async () => {
    if (selectedStratigraphy) {
      const values = getValues();
      values.date = values.date ? ensureDatetime(values.date.toString()) : null;
      await updateStratigraphy({
        ...selectedStratigraphy,
        ...values,
      });
    }
  }, [getValues, selectedStratigraphy, updateStratigraphy]);

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
        action: () => deleteStratigraphy(selectedStratigraphy),
      },
    ]);
  }, [deleteStratigraphy, selectedStratigraphy, showPrompt]);

  useEffect(() => {
    registerSaveHandler(onSave);
    registerResetHandler(resetWithoutSave);

    return () => {
      unMount();
    };
  }, [registerResetHandler, registerSaveHandler, resetWithoutSave, onSave, unMount]);

  useEffect(() => {
    // select stratigraphy if none is selected
    if (sortedStratigraphies && !hasSelectedTab) {
      const autoSelectedId = sortedStratigraphies.find(x => x.isPrimary)?.id ?? sortedStratigraphies[0]?.id;
      if (autoSelectedId !== undefined) {
        navigateToStratigraphy(autoSelectedId, true);
      }
    }
  }, [navigateToStratigraphy, sortedStratigraphies, hasSelectedTab]);

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
                    <DeleteButton onClick={showDeletePrompt} />
                    <BoreholesButton
                      variant="outlined"
                      color={"secondary"}
                      label={"duplicate"}
                      onClick={() => copyStratigraphy(selectedStratigraphy)}
                      icon={<CopyIcon />}
                    />
                    <AddStratigraphyButton
                      addEmptyStratigraphy={addEmptyStratigraphy}
                      extractStratigraphyFromProfile={extractStratigraphyFromProfile}
                    />
                  </>
                ) : (
                  <>
                    <Chip color="info" label={formatDate(selectedStratigraphy.created)} />
                  </>
                )}
              </Stack>
            </Stack>
          ) : (
            <>
              <BoreholeTabs
                value={selectedTabIndex === -1 ? 0 : selectedTabIndex}
                onChange={(_, newValue) => navigateToStratigraphy(sortedStratigraphies[newValue].id)}>
                {sortedStratigraphies.map(stratigraphy => (
                  <BoreholeTab
                    data-cy={`stratigraphy-tab-${stratigraphy.id}`}
                    key={String(stratigraphy.id)}
                    label={stratigraphy.name || t("np")}
                    hasContent
                  />
                ))}
              </BoreholeTabs>
              <AddStratigraphyButton
                addEmptyStratigraphy={addEmptyStratigraphy}
                extractStratigraphyFromProfile={extractStratigraphyFromProfile}
                sx={{ position: "absolute", top: 0, right: 0, mx: 2, my: 1 }}
              />
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
            {sortedStratigraphies.length > 1 && (
              <Stack direction="row" gap={0.75} justifyContent="flex-end">
                {editingEnabled ? (
                  <>
                    <DeleteButton onClick={showDeletePrompt} />
                    <BoreholesButton
                      variant="outlined"
                      color={"secondary"}
                      label={"duplicate"}
                      onClick={() => copyStratigraphy(selectedStratigraphy)}
                      icon={<CopyIcon />}
                    />
                  </>
                ) : (
                  <>
                    {selectedStratigraphy.isPrimary && <Chip color="info" label={t("mainStratigraphy")} />}
                    <Chip color="info" label={formatDate(selectedStratigraphy.created)} />
                  </>
                )}
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
              <TabPanel
                variant="list"
                tabs={[
                  {
                    label: t("lithology"),
                    hash: "#lithology",
                    component: <Lithology stratigraphy={selectedStratigraphy} />,
                  },
                  {
                    label: t("chronostratigraphy"),
                    hash: "#chronostratigraphy",
                    component: <ChronostratigraphyPanel stratigraphyId={selectedStratigraphy.id} />,
                  },
                  {
                    label: t("lithostratigraphy"),
                    hash: "#lithostratigraphy",
                    component: <LithostratigraphyPanel stratigraphyId={selectedStratigraphy.id} />,
                  },
                ]}
              />
            </Box>
          </BoreholeTabContentBox>
        </Box>
      </Box>
    );
  }

  return null;
};
