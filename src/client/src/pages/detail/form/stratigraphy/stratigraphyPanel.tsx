import { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { Box, Card, Chip, CircularProgress, Stack, Tooltip, Typography } from "@mui/material";
import { Trash2 } from "lucide-react";
import CopyIcon from "../../../../assets/icons/copy.svg?react";
import ExtractAiIcon from "../../../../assets/icons/extractAi.svg?react";
import { useBorehole } from "../../../../api/borehole.ts";
import { Stratigraphy, useStratigraphiesByBoreholeId, useStratigraphyMutations } from "../../../../api/stratigraphy";
import { theme } from "../../../../AppTheme";
import { AddButton, BoreholesButton, DeleteButton } from "../../../../components/buttons/buttons";
import { PromptContext } from "../../../../components/prompt/promptContext";
import { FullPageCentered } from "../../../../components/styledComponents";
import { BoreholeTab, BoreholeTabContent, BoreholeTabs } from "../../../../components/styledTabComponents";
import { TabPanel } from "../../../../components/tabs/tabPanel.tsx";
import { useBoreholeDataAvailability } from "../../../../hooks/useBoreholeDataAvailability.ts";
import { useBoreholesNavigate } from "../../../../hooks/useBoreholesNavigate";
import { useRequiredParams } from "../../../../hooks/useRequiredParams";
import { formatDate } from "../../../../utils";
import { EditStateContext } from "../../editStateContext";
import { AddStratigraphyButton } from "./addStratigraphyButton";
import ChronostratigraphyPanel from "./chronostratigraphy/chronostratigraphyPanel";
import { StratigraphyExtraction } from "./extraction/stratigraphyExtraction.tsx";
import LithostratigraphyPanel from "./lithostratigraphy/lithostratigraphyPanel";
import { StratigraphyProvider } from "./stratigraphyContext.tsx";
import { StratigraphyForm } from "./stratigraphyForm.tsx";
import { LithologyPanel } from "./stratigraphyV2/lithologyV2/lithologyPanel.tsx";

export const StratigraphyPanel: FC = () => {
  const [filePickerOpen, setFilePickerOpen] = useState(false);
  const justCopiedRef = useRef(false);
  const { id: boreholeId, stratigraphyId } = useRequiredParams();
  const { navigateTo } = useBoreholesNavigate();
  const location = useLocation();
  const { data: stratigraphies } = useStratigraphiesByBoreholeId(Number(boreholeId));
  const { data: borehole } = useBorehole(Number(boreholeId));
  const { hasLithology, hasLithostratigraphy, hasChronostratigraphy } = useBoreholeDataAvailability(borehole);
  const {
    copy: { mutateAsync: copyStratigraphy },
    delete: { mutateAsync: deleteStratigraphy },
  } = useStratigraphyMutations();
  const { editingEnabled } = useContext(EditStateContext);
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);

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
          lithologies: null,
          chronostratigraphyLayers: null,
          lithostratigraphyLayers: null,
        },
      ];
    }
    return existingStratigraphies;
  }, [boreholeId, stratigraphies, stratigraphyId]);

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
    (stratigraphyId: number | undefined, replace = false) => {
      if (stratigraphyId !== undefined) {
        navigateTo({
          path: `/${boreholeId}/stratigraphy/${stratigraphyId === 0 ? "new" : stratigraphyId}`,
          hash: location.hash,
          replace,
        });
      } else {
        navigateTo({
          path: `/${boreholeId}/stratigraphy`,
          replace,
        });
      }
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

  const extractStratigraphyFromProfile = useCallback(() => {
    setFilePickerOpen(true);
  }, []);

  const addEmptyStratigraphy = useCallback(async () => {
    navigateToStratigraphy(0);
  }, [navigateToStratigraphy]);

  const deleteSelectedStratigraphy = useCallback(async () => {
    if (!selectedStratigraphy) return;
    await deleteStratigraphy(selectedStratigraphy);
    navigateToStratigraphy(undefined, true);
  }, [deleteStratigraphy, navigateToStratigraphy, selectedStratigraphy]);

  const onCopy = useCallback(async () => {
    if (selectedStratigraphy) {
      justCopiedRef.current = true;
      const newStratigraphyId: number = await copyStratigraphy(selectedStratigraphy);
      navigateToStratigraphy(newStratigraphyId, true);
    }
  }, [copyStratigraphy, navigateToStratigraphy, selectedStratigraphy]);

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
    if (!boreholeId) return;
    // Prevents default navigation after copying
    if (justCopiedRef.current) {
      justCopiedRef.current = false;
      return;
    }
    if (
      sortedStratigraphies?.length &&
      (stratigraphyId === undefined ||
        (stratigraphyId !== "new" && !sortedStratigraphies.some(x => x.id === Number(stratigraphyId))))
    ) {
      const primaryId = sortedStratigraphies.find(x => x.isPrimary)?.id ?? sortedStratigraphies[0].id ?? -1;
      navigateToStratigraphy(primaryId === -1 ? undefined : primaryId, true);
    } else if (sortedStratigraphies && sortedStratigraphies.length === 0 && stratigraphyId !== "new") {
      navigateToStratigraphy(undefined, true);
    }
  }, [boreholeId, stratigraphyId, sortedStratigraphies, navigateToStratigraphy]);

  if (!sortedStratigraphies) {
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );
  } else if (sortedStratigraphies.length === 0) {
    return (
      <>
        <Card sx={{ p: 4 }}>
          <Typography>{t("noStratigraphy")}</Typography>
          {editingEnabled && (
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <AddButton label="addEmptyStratigraphy" variant="contained" onClick={addEmptyStratigraphy} />
              <BoreholesButton
                label="extractStratigraphyFromProfile"
                variant="contained"
                icon={<ExtractAiIcon />}
                onClick={extractStratigraphyFromProfile}
              />
            </Stack>
          )}
        </Card>
        <StratigraphyExtraction
          boreholeId={boreholeId}
          filePickerOpen={filePickerOpen}
          setFilePickerOpen={setFilePickerOpen}
        />
      </>
    );
  }

  if (selectedStratigraphy) {
    return (
      <StratigraphyProvider>
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
            <BoreholeTabContent
              data-cy="stratigraphy-content"
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
                <StratigraphyForm
                  selectedStratigraphy={selectedStratigraphy}
                  stratigraphyCount={sortedStratigraphies.length}
                  navigateToStratigraphy={navigateToStratigraphy}
                />
              )}
              <Box sx={{ position: "relative" }}>
                <TabPanel
                  variant="list"
                  tabs={[
                    {
                      label: t("lithology"),
                      hash: "#lithology",
                      component: <LithologyPanel stratigraphyId={selectedStratigraphy.id} />,
                      hasContent: hasLithology,
                    },
                    {
                      label: t("chronostratigraphy"),
                      hash: "#chronostratigraphy",
                      component: <ChronostratigraphyPanel stratigraphyId={selectedStratigraphy.id} />,
                      hasContent: hasLithostratigraphy,
                    },
                    {
                      label: t("lithostratigraphy"),
                      hash: "#lithostratigraphy",
                      component: <LithostratigraphyPanel stratigraphyId={selectedStratigraphy.id} />,
                      hasContent: hasChronostratigraphy,
                    },
                  ]}
                />
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
            </BoreholeTabContent>
          </Box>
          <StratigraphyExtraction
            boreholeId={boreholeId}
            filePickerOpen={filePickerOpen}
            setFilePickerOpen={setFilePickerOpen}
          />
        </Box>
      </StratigraphyProvider>
    );
  }

  return <Box />;
};
