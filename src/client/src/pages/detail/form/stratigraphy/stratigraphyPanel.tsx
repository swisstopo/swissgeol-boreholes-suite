import { FC, useCallback, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Box, Card, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import CopyIcon from "../../../../assets/icons/copy.svg?react";
import ExtractAiIcon from "../../../../assets/icons/extractAi.svg?react";
import { useStratigraphiesByBoreholeId, useStratigraphyMutations } from "../../../../api/stratigraphy.ts";
import { theme } from "../../../../AppTheme.ts";
import { AddButton, BoreholesButton, DeleteButton } from "../../../../components/buttons/buttons.tsx";
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
    delete: { mutate: deleteStratigraphy },
  } = useStratigraphyMutations();
  const { editingEnabled } = useContext(EditStateContext);
  const { t } = useTranslation();
  const { registerSaveHandler, registerResetHandler, unMount, markAsChanged } =
    useContext<SaveContextProps>(SaveContext);
  useBlockNavigation();

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

  const resetWithoutSave = useCallback(async () => {
    // TODO: Implement a way to reset the form without saving changes
  }, []);

  const onSave = useCallback(async () => {
    // TODO: Implement the save logic for the stratigraphy form
  }, []);

  useEffect(() => {
    //TODO: Implement a way to mark the form as changed when any field is modified
    markAsChanged(false);
  }, [markAsChanged]);

  useEffect(() => {
    registerSaveHandler(onSave);
    registerResetHandler(resetWithoutSave);

    return () => {
      unMount();
    };
  }, [registerResetHandler, registerSaveHandler, resetWithoutSave, onSave, unMount]);

  const selectedTabIndex = stratigraphies?.findIndex(x => x.id === Number(stratigraphyId)) ?? -1;
  const hasSelectedTab = selectedTabIndex !== -1;
  const selectedStratigraphy = hasSelectedTab ? stratigraphies?.[selectedTabIndex] : undefined;

  useEffect(() => {
    // select stratigraphy if none is selected
    if (stratigraphies && !hasSelectedTab) {
      const autoSelectedId = stratigraphies.find(x => x.isPrimary)?.id ?? stratigraphies[0]?.id;
      if (autoSelectedId !== undefined) {
        navigateToStratigraphy(autoSelectedId, true);
      }
    }
  }, [navigateToStratigraphy, stratigraphies, hasSelectedTab]);

  if (!stratigraphies) {
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );
  } else if (stratigraphies.length === 0) {
    return (
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
  }

  if (selectedStratigraphy) {
    return (
      <Box>
        <Box sx={{ position: "relative" }}>
          {stratigraphies.length === 1 ? (
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
                    <DeleteButton onClick={() => deleteStratigraphy(selectedStratigraphy)} />
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
                onChange={(_, newValue) => navigateToStratigraphy(stratigraphies[newValue].id)}>
                {stratigraphies.map(stratigraphy => (
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
            {stratigraphies.length > 1 && (
              <Stack direction="row" gap={0.75} justifyContent="flex-end">
                {editingEnabled ? (
                  <>
                    <DeleteButton onClick={() => deleteStratigraphy(selectedStratigraphy)} />
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
