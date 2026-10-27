import { FC, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardActions, CardContent, CircularProgress, Grid2, Typography } from "@mui/material/";
import {
  BoreholeGeometryPoint,
  useBoreholeGeometry,
  useBoreholeGeometryMutations,
} from "../../../../api/fetchApiV2.ts";
import { DeleteButton } from "../../../../components/buttons/buttons.tsx";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { useRequiredId } from "../../../../hooks/useRequiredId.ts";
import { useResetTabStatus } from "../../../../hooks/useResetTabStatus.ts";
import { EditStateContext } from "../../editStateContext.tsx";
import GeometryChartNE from "./geometryChartNE.tsx";
import { GeometryChartZE, GeometryChartZInteractive, GeometryChartZN } from "./geometryChartZ.tsx";
import GeometryImport from "./geometryImport.tsx";
import GeometryTable from "./geometryTable.tsx";

interface GeometryProps {
  measuredDepth: number; // The measured depth to show a perfectly vertical geometry if no geometry is set.
}

// Renders the Geometry panel.
const Geometry: FC<GeometryProps> = ({ measuredDepth }) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(EditStateContext);
  const boreholeId = useRequiredId();
  const { data } = useBoreholeGeometry(boreholeId);
  const resetTabStatus = useResetTabStatus(["geometry"]);

  const {
    delete: { mutate: deleteBoreholeGeometry, isPending: isDeletingBoreholeGeometry },
  } = useBoreholeGeometryMutations();

  const defaultData: BoreholeGeometryPoint[] = [
    { md: 0, x: 0, y: 0, z: 0 },
    { md: measuredDepth, x: 0, y: 0, z: measuredDepth },
  ];

  if (!data) {
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );
  }

  const anyDataPresent = data.length > 0;

  if (!anyDataPresent && !measuredDepth && !editingEnabled) {
    return (
      <FullPageCentered>
        <Typography variant="fullPageMessage">{t("msgBoreholeGeometryEmpty")}</Typography>
      </FullPageCentered>
    );
  }

  const chartData = anyDataPresent ? data : defaultData;

  return (
    <Grid2 container spacing={2}>
      {editingEnabled && (
        <Grid2 size={12}>
          <GeometryImport boreholeId={boreholeId} />
        </Grid2>
      )}
      {editingEnabled && anyDataPresent && (
        <Grid2 size={12}>
          <Card>
            <CardActions>
              <DeleteButton
                sx={{ marginLeft: "auto" }}
                onClick={() => {
                  resetTabStatus();
                  deleteBoreholeGeometry(boreholeId);
                }}
                endIcon={isDeletingBoreholeGeometry && <CircularProgress size="1em" sx={{ color: "currentColor" }} />}
              />
            </CardActions>
          </Card>
        </Grid2>
      )}
      {(!editingEnabled || anyDataPresent) &&
        [
          <GeometryChartNE key="chartNE" data={chartData} />,
          <GeometryChartZN key="chartZN" data={chartData} />,
          <GeometryChartZE key="chartZE" data={chartData} />,
          <GeometryChartZInteractive key="chartZInteractive" data={chartData} />,
          <GeometryTable key="table" data={chartData} />,
        ].map(panel => (
          <Grid2 key={panel.key} size={{ xs: 12, lg: 6, xl: 4 }}>
            <Card>
              <CardContent>{panel}</CardContent>
            </Card>
          </Grid2>
        ))}
    </Grid2>
  );
};

export default Geometry;
