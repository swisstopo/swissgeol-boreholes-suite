import { FC, useCallback, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Card, CircularProgress, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { createStratigraphy, useLithologyStratigraphies } from "../../../../api/fetchApiV2.ts";
import { AddButton } from "../../../../components/buttons/buttons.tsx";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { BoreholeTab, BoreholeTabContentBox, BoreholeTabs } from "../../../../components/styledTabComponents.tsx";
import { TabPanel } from "../../../../components/tabs/tabPanel.tsx";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { DetailContext } from "../../detailContext.tsx";
import { AddStratigraphyButton } from "./addStratigraphyButton.tsx";
import ChronostratigraphyPanel from "./chronostratigraphy/chronostratigraphyPanel.jsx";
import { Lithology } from "./lithology/lithology.tsx";
import InfoList from "./lithology/lithologyInfo/infoList/InfoList.jsx";
import LithostratigraphyPanel from "./lithostratigraphy/lithostratigraphyPanel.jsx";

export const StratigraphyPanel: FC = () => {
  const params = useRequiredParams();
  const boreholeId = Number(params.id);
  const stratigraphyId = params.stratigraphyId ? Number(params.stratigraphyId) : undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const { data: stratigraphyData, refetch: refetchStratigraphyData } = useLithologyStratigraphies(Number(boreholeId));
  const { editingEnabled } = useContext(DetailContext);
  const { t } = useTranslation();

  const navigateToStratigraphy = useCallback(
    (stratigraphyId: number, replace = false) => {
      navigate(
        {
          pathname: `/${boreholeId}/stratigraphy/${stratigraphyId}`,
          hash: location.hash,
        },
        { replace },
      );
    },
    [location.hash, navigate, boreholeId],
  );

  const addEmptyStratigraphy = useCallback(async () => {
    const stratigraphy = await createStratigraphy(boreholeId);
    await refetchStratigraphyData();
    navigateToStratigraphy(stratigraphy.id);
  }, [boreholeId, navigateToStratigraphy, refetchStratigraphyData]);

  const extractStratigraphyFromProfile = useCallback(() => {}, []);

  const selectedTabIndex = stratigraphyData?.findIndex(x => x.id === stratigraphyId) ?? -1;
  const hasSelectedTab = selectedTabIndex !== -1;
  const selectedStratigraphy = hasSelectedTab ? stratigraphyData?.[selectedTabIndex] : undefined;

  useEffect(() => {
    // select stratigraphy if none is selected
    if (stratigraphyData && !hasSelectedTab) {
      const autoSelectedId = stratigraphyData.find(x => x.isPrimary)?.id ?? stratigraphyData[0]?.id;
      if (autoSelectedId !== undefined) {
        navigateToStratigraphy(autoSelectedId, true);
      }
    }
  }, [navigateToStratigraphy, stratigraphyData, hasSelectedTab]);

  if (!stratigraphyData) {
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );
  } else if (stratigraphyData.length === 0) {
    return (
      <Card sx={{ p: 4 }}>
        <Typography variant="body2">{t("noStratigraphy")}</Typography>
        {editingEnabled && (
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <AddButton label="addEmptyStratigraphy" variant="contained" onClick={() => addEmptyStratigraphy()} />
            <AddButton
              label="extractStratigraphyFromProfile"
              variant="contained"
              disabled
              onClick={() => extractStratigraphyFromProfile()}
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
          onChange={(_, newValue) => navigateToStratigraphy(stratigraphyData[newValue].id)}>
          {stratigraphyData.map(stratigraphy => (
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
          />
        )}
        <BoreholeTabContentBox sx={{ mb: 2 }}>
          {selectedStratigraphy && (
            <InfoList
              id={stratigraphyId}
              profileInfo={selectedStratigraphy}
              onUpdated={() => {
                refetchStratigraphyData();
              }}
            />
          )}
          <Box sx={{ position: "relative", mt: 2 }}>
            <TabPanel
              variant="list"
              tabs={[
                {
                  label: t("lithology"),
                  hash: "#lithology",
                  component: selectedStratigraphy && <Lithology stratigraphy={selectedStratigraphy} />,
                },
                {
                  label: t("chronostratigraphy"),
                  hash: "#chronostratigraphy",
                  component: selectedStratigraphy && (
                    <ChronostratigraphyPanel stratigraphyId={selectedStratigraphy.id} />
                  ),
                },
                {
                  label: t("lithostratigraphy"),
                  hash: "#lithostratigraphy",
                  component: selectedStratigraphy && (
                    <LithostratigraphyPanel stratigraphyId={selectedStratigraphy.id} />
                  ),
                },
              ]}
            />
          </Box>
        </BoreholeTabContentBox>
      </Box>
    </Box>
  );
};
