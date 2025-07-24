import { FC, useCallback, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Box, Card, CircularProgress, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { useLegacyStratigraphiesByBoreholeId, useLegacyStratigraphyMutations } from "../../../../api/stratigraphy.ts";
import { AddButton } from "../../../../components/buttons/buttons.tsx";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { BoreholeTab, BoreholeTabContentBox, BoreholeTabs } from "../../../../components/styledTabComponents.tsx";
import { TabPanel } from "../../../../components/tabs/tabPanel.tsx";
import { useBoreholesNavigate } from "../../../../hooks/useBoreholesNavigate.tsx";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { EditStateContext } from "../../editStateContext.tsx";
import { AddStratigraphyButton } from "./addStratigraphyButton.tsx";
import ChronostratigraphyPanel from "./chronostratigraphy/chronostratigraphyPanel.jsx";
import { Lithology } from "./lithology/lithology.tsx";
import LithostratigraphyPanel from "./lithostratigraphy/lithostratigraphyPanel.jsx";
import { StratigraphyForm } from "./stratigraphyForm.tsx";

export const LegacyStratigraphyPanel: FC = () => {
  const { id: boreholeId, stratigraphyId } = useRequiredParams();
  const { navigateTo } = useBoreholesNavigate();
  const location = useLocation();
  const { data: stratigraphies } = useLegacyStratigraphiesByBoreholeId(Number(boreholeId));
  const {
    add: { mutateAsync: addStratigraphyAsync },
  } = useLegacyStratigraphyMutations();
  const { editingEnabled } = useContext(EditStateContext);
  const { t } = useTranslation();

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
            <AddButton
              label="extractStratigraphyFromProfile"
              variant="contained"
              disabled
              onClick={extractStratigraphyFromProfile}
            />
          </Stack>
        )}
      </Card>
    );
  }

  return (
    <Box>
      <Box sx={{ position: "relative" }}>
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
        {editingEnabled && (
          <AddStratigraphyButton
            addEmptyStratigraphy={addEmptyStratigraphy}
            extractStratigraphyFromProfile={extractStratigraphyFromProfile}
            sx={{ position: "absolute", top: 0, right: 0, mx: 2, my: 1 }}
          />
        )}
        <BoreholeTabContentBox sx={{ mb: 2 }}>
          {selectedStratigraphy && (
            <>
              <StratigraphyForm stratigraphy={selectedStratigraphy} />
              <Box sx={{ position: "relative", mt: 2 }}>
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
            </>
          )}
        </BoreholeTabContentBox>
      </Box>
    </Box>
  );
};
