import { FC, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Card, CircularProgress, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { useLithologyStratigraphies } from "../../../../api/fetchApiV2.ts";
import { AddButton } from "../../../../components/buttons/buttons.tsx";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { BoreholeTab, BoreholeTabContentBox, BoreholeTabs } from "../../../../components/styledTabComponents.tsx";
import { TabPanel } from "../../../../components/tabs/tabPanel.tsx";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { Lithology } from "./lithology/lithology.tsx";
import InfoList from "./lithology/lithologyInfo/infoList/InfoList.jsx";

export const StratigraphyPanel: FC = () => {
  const { id: selectedBoreholeId } = useRequiredParams();
  const params = useParams();
  const stratigraphyId = params.stratigraphyId ? Number(params.stratigraphyId) : undefined;
  const navigate = useNavigate();
  const { data: stratigraphyData, refetch: refetchStratigraphyData } = useLithologyStratigraphies(
    Number(selectedBoreholeId),
  );
  const { t } = useTranslation();

  const navigateToStratigraphy = useCallback(
    (stratigraphyId: number, replace = false) => {
      navigate(`/${selectedBoreholeId}/stratigraphy/${stratigraphyId}`, { replace });
    },
    [navigate, selectedBoreholeId],
  );

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
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <AddButton label="addEmptyStratigraphy" variant="contained" disabled onClick={() => {}} />
          <AddButton label="extractStratigraphyFromProfile" variant="contained" disabled onClick={() => {}} />
        </Stack>
      </Card>
    );
  }

  return (
    <Box>
      <BoreholeTabs
        value={selectedTabIndex}
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
      </BoreholeTabContentBox>
      <TabPanel
        tabs={[
          {
            label: t("lithology"),
            hash: "#lithology",
            component: selectedStratigraphy && <Lithology stratigraphy={selectedStratigraphy} />,
          },
        ]}
      />
    </Box>
  );
};
