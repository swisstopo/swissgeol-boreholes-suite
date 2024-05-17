import { useTranslation } from "react-i18next";
import GeometryImport from "./geometryImport";
import GeometryTable from "./geometryTable";
import GeometryChartNE from "./geometryChartNE";
import { GeometryChartZInteractive, GeometryChartZE, GeometryChartZN } from "./geometryChartZ";
import { CircularProgress, Typography, Grid, Card, CardActions, CardContent } from "@mui/material/";
import { FullPageCentered } from "../../../../components/baseComponents";
import { useBoreholeGeometry, useBoreholeGeometryMutations } from "../../../../api/fetchApiV2";
import { DeleteButton } from "../../../../components/buttons/buttons";

const Geometry = ({ boreholeId, isEditable }) => {
  const { t } = useTranslation();

  const { data } = useBoreholeGeometry(boreholeId);
  const {
    delete: { mutate: deleteBoreholeGeometry },
  } = useBoreholeGeometryMutations();

  return (
    <>
      {!data ? (
        <FullPageCentered>
          <CircularProgress />
        </FullPageCentered>
      ) : data?.length === 0 && !isEditable ? (
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
          {data?.length > 0 && (
            <>
              {isEditable && (
                <Grid item xs={12}>
                  <Card>
                    <CardActions>
                      <DeleteButton sx={{ marginLeft: "auto" }} onClick={() => deleteBoreholeGeometry(boreholeId)} />
                    </CardActions>
                  </Card>
                </Grid>
              )}
              {[
                <GeometryChartNE key="" data={data} />,
                <GeometryChartZN key="" data={data} />,
                <GeometryChartZE key="" data={data} />,
                <GeometryChartZInteractive key="" data={data} />,
                <GeometryTable key="" data={data} />,
              ].map((panel, i) => (
                <Grid key={i} item xs={12} lg={6} xl={4}>
                  <Card>
                    <CardContent>{panel}</CardContent>
                  </Card>
                </Grid>
              ))}
            </>
          )}
        </Grid>
      )}
    </>
  );
};

export default Geometry;
