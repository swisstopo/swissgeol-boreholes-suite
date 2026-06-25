import { FC, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router";
import { Box, Card, Chip, CircularProgress, Stack, Tooltip, Typography } from "@mui/material";
import { Trash2, X } from "lucide-react";
import CopyIcon from "../../../../assets/icons/copy.svg?react";
import ExtractAiIcon from "../../../../assets/icons/extractAi.svg?react";
import { useBorehole } from "../../../../api/borehole.ts";
import { Stratigraphy } from "../../../../api/generated";
import { theme } from "../../../../AppTheme";
import { AddButton, BoreholesButton, DeleteButton } from "../../../../components/buttons/buttons";
import { PromptContext } from "../../../../components/prompt/promptContext";
import { FullPageCentered } from "../../../../components/styledComponents";
import { BoreholeTab, BoreholeTabContent, BoreholeTabs } from "../../../../components/styledTabComponents";
import { TabPanel } from "../../../../components/tabs/tabPanel.tsx";
import { useBoreholeDataAvailability } from "../../../../hooks/useBoreholeDataAvailability.ts";
import { useBoreholesNavigate } from "../../../../hooks/useBoreholesNavigate";
import { useRequiredId } from "../../../../hooks/useRequiredId.ts";
import { formatDate } from "../../../../utils";
import { EditStateContext } from "../../editStateContext";
import { SaveContext } from "../../saveContext.tsx";
import { useChronostratigraphyEditProfile } from "./chronostratigraphy/useChronostratigraphyEditProfile.tsx";
import { AddEmptyStratigraphyDialog } from "./components/addEmptyStratigraphyDialog/addEmptyStratigraphyDialog.tsx";
import { AddStratigraphyButton } from "./components/addStratigraphyButton.tsx";
import { StratigraphyExtraction } from "./extraction/stratigraphyExtraction.tsx";
import { LithologyPanel } from "./lithology/lithologyPanel.tsx";
import { useLithostratigraphyEditProfile } from "./lithostratigraphy/useLithostratigraphyEditProfile.tsx";
import { useStratigraphiesByBoreholeId, useStratigraphyMutations } from "./stratigraphy.ts";
import { StratigraphyProvider } from "./stratigraphyContext.tsx";
import { StratigraphyEditPanel } from "./StratigraphyEditPanel.tsx";
import { StratigraphyForm } from "./stratigraphyForm.tsx";

export const StratigraphyPanel: FC = () => {
  const [filePickerOpen, setFilePickerOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const justCopiedRef = useRef(false);
  const boreholeId = useRequiredId();
  const { stratigraphyId: stratigraphyIdParam } = useParams();
  const stratigraphyId = stratigraphyIdParam ? Number.parseInt(stratigraphyIdParam, 10) : undefined;
  const { navigateTo } = useBoreholesNavigate();
  const location = useLocation();
  const { data: stratigraphies } = useStratigraphiesByBoreholeId(boreholeId);
  const { data: borehole } = useBorehole(boreholeId);
  const { hasLithology, hasLithostratigraphy, hasChronostratigraphy } = useBoreholeDataAvailability(borehole);
  const {
    copy: { mutateAsync: copyStratigraphy },
    delete: { mutateAsync: deleteStratigraphy },
  } = useStratigraphyMutations();
  const { editingEnabled } = useContext(EditStateContext);
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);
  const { hasChanges, triggerReset } = useContext(SaveContext);

  const sortedStratigraphies: Stratigraphy[] | undefined = useMemo(() => {
    if (!stratigraphies) return stratigraphies;
    return [...stratigraphies].sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [stratigraphies]);

  const selectedTabIndex: number = useMemo(
    () => sortedStratigraphies?.findIndex(x => x.id === stratigraphyId) ?? -1,
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
          path: `/${boreholeId}/stratigraphy/${stratigraphyId}`,
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

  const guardNewStratigraphyMenu = useCallback(
    (proceed: () => void) => {
      if (!hasChanges) {
        proceed();
        return;
      }
      showPrompt("messageDiscardUnsavedChanges", [
        {
          label: "cancel",
          icon: <X />,
          variant: "outlined",
        },
        {
          label: "discardchanges",
          icon: <Trash2 />,
          variant: "contained",
          action: () => {
            triggerReset();
            proceed();
          },
        },
      ]);
    },
    [hasChanges, showPrompt, triggerReset],
  );

  const extractStratigraphyFromProfile = useCallback(() => {
    setFilePickerOpen(true);
  }, []);

  const addEmptyStratigraphy = useCallback(() => {
    setAddDialogOpen(true);
  }, []);

  const deleteSelectedStratigraphy = useCallback(async () => {
    if (!selectedStratigraphy) return;
    await deleteStratigraphy(selectedStratigraphy);
  }, [deleteStratigraphy, selectedStratigraphy]);

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
      (stratigraphyId === undefined || !sortedStratigraphies.some(x => x.id === stratigraphyId))
    ) {
      const primaryId = sortedStratigraphies.find(x => x.isPrimary)?.id ?? sortedStratigraphies[0].id ?? -1;
      navigateToStratigraphy(primaryId === -1 ? undefined : primaryId, true);
    } else if (sortedStratigraphies?.length === 0) {
      navigateToStratigraphy(undefined, true);
    }
  }, [boreholeId, stratigraphyId, sortedStratigraphies, navigateToStratigraphy]);

  let body: ReactNode = null;
  if (!sortedStratigraphies) {
    body = (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );
  } else if (sortedStratigraphies.length === 0) {
    body = (
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
    );
  } else if (selectedStratigraphy) {
    body = (
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
                      <DeleteButton onClick={showDeletePrompt} />
                      <BoreholesButton
                        variant="outlined"
                        color={"secondary"}
                        label={"duplicate"}
                        onClick={onCopy}
                        icon={<CopyIcon />}
                      />
                      <AddStratigraphyButton
                        addEmptyStratigraphy={addEmptyStratigraphy}
                        extractStratigraphyFromProfile={extractStratigraphyFromProfile}
                        onBeforeOpen={guardNewStratigraphyMenu}
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
                    onBeforeOpen={guardNewStratigraphyMenu}
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
              {sortedStratigraphies.length > 1 && editingEnabled && (
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
                      component: (
                        <StratigraphyEditPanel
                          stratigraphyId={selectedStratigraphy.id}
                          useEditProfile={useChronostratigraphyEditProfile}
                        />
                      ),
                      hasContent: hasChronostratigraphy,
                    },
                    {
                      label: t("lithostratigraphy"),
                      hash: "#lithostratigraphy",
                      component: (
                        <StratigraphyEditPanel
                          stratigraphyId={selectedStratigraphy.id}
                          useEditProfile={useLithostratigraphyEditProfile}
                        />
                      ),
                      hasContent: hasLithostratigraphy,
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
        </Box>
      </StratigraphyProvider>
    );
  }

  return (
    <>
      {body}
      <StratigraphyExtraction
        boreholeId={boreholeId}
        filePickerOpen={filePickerOpen}
        setFilePickerOpen={setFilePickerOpen}
      />
      <AddEmptyStratigraphyDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        boreholeId={boreholeId}
        isFirstStratigraphy={!stratigraphies?.length}
        onCreated={id => navigateToStratigraphy(id, true)}
      />
    </>
  );
};
