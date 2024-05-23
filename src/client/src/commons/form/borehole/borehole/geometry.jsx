import { useTranslation } from "react-i18next";
import GeometryImport from "./geometryImport";
import GeometryTable from "./geometryTable";
import GeometryChartNE from "./geometryChartNE";
import { GeometryChartZInteractive, GeometryChartZE, GeometryChartZN } from "./geometryChartZ";
import { CircularProgress, Typography, Grid, Card, CardActions, CardContent } from "@mui/material/";
import { FullPageCentered } from "../../../../components/baseComponents";
import { useBoreholeGeometry, useBoreholeGeometryMutations } from "../../../../api/fetchApiV2";
import { DeleteButton } from "../../../../components/buttons/buttons";

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
    delete: { mutate: deleteBoreholeGeometry },
  } = useBoreholeGeometryMutations();

  const defaultData = [
    { md: 0, x: 0, y: 0, z: 0 },
    { md: measuredDepth, x: 0, y: 0, z: measuredDepth },
  ];

  return (
    <>
      {!data ? (
        <FullPageCentered>
          <CircularProgress />
        </FullPageCentered>
      ) : data?.length === 0 && !measuredDepth && !isEditable ? (
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
          {isEditable && data.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardActions>
                  <DeleteButton sx={{ marginLeft: "auto" }} onClick={() => deleteBoreholeGeometry(boreholeId)} />
                </CardActions>
              </Card>
            </Grid>
          )}
          {(data.length > 0 || !isEditable) &&
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
