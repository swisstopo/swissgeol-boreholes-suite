import { useTranslation } from "react-i18next";
import GeometryImport from "./geometryImport.jsx";
import GeometryTable from "./geometryTable.jsx";
import GeometryChartNE from "./geometryChartNE.jsx";
import { GeometryChartZE, GeometryChartZInteractive, GeometryChartZN } from "./geometryChartZ.jsx";
import { Card, CardActions, CardContent, CircularProgress, Grid, Typography } from "@mui/material/";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { useBoreholeGeometry, useBoreholeGeometryMutations } from "../../../../api/fetchApiV2.js";
import { DeleteButton } from "../../../../components/buttons/buttons.tsx";

/**
 * Renders the Geometry panel.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.boreholeId - The ID of the borehole.
 * @param {boolean} props.isEditable - Indicates whether the component is editable.
 * @param {number} props.measuredDepth - The measured depth to show a perfectly vertical geometry if no geometry is set.
 * @returns {JSX.Element} The rendered Geometry component.
 */
const Geometry = ({ boreholeId, isEditable, measuredDepth }) => {
  const { t } = useTranslation();
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
      ) : !anyDataPresent && !measuredDepth && !isEditable ? (
        <FullPageCentered>
          <Typography variant="fullPageMessage">{t("msgBoreholeGeometryEmpty")}</Typography>
        </FullPageCentered>
      ) : (
        <Grid container spacing={2}>
          {isEditable && (
            <>
              <Grid item xs={12}>
                <GeometryImport boreholeId={boreholeId} hasData={data?.length > 0} />
              </Grid>
            </>
          )}
          {isEditable && anyDataPresent && (
            <Grid item xs={12}>
              <Card>
                <CardActions>
                  <DeleteButton
                    label="delete"
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
          {(!isEditable || anyDataPresent) &&
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
