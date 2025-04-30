import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardActions, CardContent, CircularProgress, Grid, Typography } from "@mui/material/";
import { useBoreholeGeometry, useBoreholeGeometryMutations } from "../../../../api/fetchApiV2.ts";
import { DeleteButton } from "../../../../components/buttons/buttons.tsx";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { DetailContext } from "../../detailContext.tsx";
import GeometryChartNE from "./geometryChartNE.jsx";
import { GeometryChartZE, GeometryChartZInteractive, GeometryChartZN } from "./geometryChartZ.jsx";
import GeometryImport from "./geometryImport.jsx";
import GeometryTable from "./geometryTable.jsx";

/**
 * Renders the Geometry panel.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {number} props.measuredDepth - The measured depth to show a perfectly vertical geometry if no geometry is set.
 * @returns {JSX.Element} The rendered Geometry component.
 */
const Geometry = ({ measuredDepth }) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(DetailContext);
  const { id: boreholeId } = useRequiredParams();
  const { data } = useBoreholeGeometry(boreholeId);
  const {
    delete: { mutate: deleteBoreholeGeometry, isLoading: isDeletingBoreholeGeometry },
  } = useBoreholeGeometryMutations();

  const defaultData = [
    { md: 0, x: 0, y: 0, z: 0 },
    { md: measuredDepth, x: 0, y: 0, z: measuredDepth },
  ];

  const noDataLoaded = !data;
  const anyDataPresent = data?.length > 0;

  return (
    <>
      {noDataLoaded ? (
        <FullPageCentered>
          <CircularProgress />
        </FullPageCentered>
      ) : !anyDataPresent && !measuredDepth && !editingEnabled ? (
        <FullPageCentered>
          <Typography variant="fullPageMessage">{t("msgBoreholeGeometryEmpty")}</Typography>
        </FullPageCentered>
      ) : (
        <Grid container spacing={2}>
          {editingEnabled && (
            <>
              <Grid item xs={12}>
                <GeometryImport boreholeId={boreholeId} hasData={data?.length > 0} />
              </Grid>
            </>
          )}
          {editingEnabled && anyDataPresent && (
            <Grid item xs={12}>
              <Card>
                <CardActions>
                  <DeleteButton
                    sx={{ marginLeft: "auto" }}
                    onClick={() => deleteBoreholeGeometry(boreholeId)}
                    endIcon={
                      isDeletingBoreholeGeometry && <CircularProgress size="1em" sx={{ color: "currentColor" }} />
                    }
                  />
                </CardActions>
              </Card>
            </Grid>
          )}
          {(!editingEnabled || anyDataPresent) &&
            [
              <GeometryChartNE key="" data={data.length === 0 ? defaultData : data} />,
              <GeometryChartZN key="" data={data.length === 0 ? defaultData : data} />,
              <GeometryChartZE key="" data={data.length === 0 ? defaultData : data} />,
              <GeometryChartZInteractive key="" data={data.length === 0 ? defaultData : data} />,
              <GeometryTable key="" data={data.length === 0 ? defaultData : data} />,
            ].map((panel, i) => (
              <Grid key={i} item xs={12} lg={6} xl={4}>
                <Card>
                  <CardContent>{panel}</CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}
    </>
  );
};

export default Geometry;
