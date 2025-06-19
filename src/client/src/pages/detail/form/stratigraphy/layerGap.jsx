import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { AddCircle, ArrowDownward, ArrowUpward, Warning } from "@mui/icons-material";
import { Card, CardActionArea, Stack, Typography } from "@mui/material";
import { theme } from "../../../../AppTheme.ts";
import { EditStateContext } from "../../editStateContext.tsx";

const IconTypography = ({ icon, text }) => {
  return (
    <Typography
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1em 2em",
      }}>
      {icon}
      {text}
      {icon}
    </Typography>
  );
};

/**
 * Component that is displayed if there is a gap between two layers.
 * It offers solutions to fix the gap like extending the upper layer or filling the gap with an empty layers.
 */
const LayerGap = ({ addLayer, updateLayer, previousLayer, nextLayer, height }) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(EditStateContext);

  return (
    <Card square variant="outlined">
      <Stack
        sx={{
          height: `${height}px`,
          justifyContent: "space-evenly",
          color: theme.palette.error.main,
        }}>
        {!editingEnabled && <IconTypography text={t("errorGap")} icon={<Warning />} />}
        {editingEnabled && (
          <>
            {previousLayer && (
              <CardActionArea
                sx={{ flex: 1 }}
                onClick={() =>
                  updateLayer({
                    ...previousLayer,
                    toDepth: nextLayer.fromDepth,
                  })
                }>
                <IconTypography text={t("errorGapSolution_extendUpperLayer")} icon={<ArrowDownward />} />
              </CardActionArea>
            )}
            <CardActionArea
              sx={{ flex: 1 }}
              onClick={() =>
                addLayer({
                  stratigraphyId: nextLayer.stratigraphyId,
                  fromDepth: previousLayer?.toDepth ?? 0,
                  toDepth: nextLayer.fromDepth,
                })
              }>
              <IconTypography text={t("errorGapSolution_fillWithUndefined")} icon={<AddCircle />} />
            </CardActionArea>
            {!previousLayer && (
              <CardActionArea
                sx={{ flex: 1 }}
                onClick={() =>
                  updateLayer({
                    ...nextLayer,
                    fromDepth: 0,
                  })
                }>
                <IconTypography text={t("errorGapSolution_extendLowerToZero")} icon={<ArrowUpward />} />
              </CardActionArea>
            )}
            {previousLayer && (
              <CardActionArea
                sx={{ flex: 1 }}
                onClick={() =>
                  updateLayer({
                    ...nextLayer,
                    fromDepth: previousLayer.toDepth,
                  })
                }>
                <IconTypography text={t("errorGapSolution_extendLowerLayer")} icon={<ArrowUpward />} />
              </CardActionArea>
            )}
          </>
        )}
      </Stack>
    </Card>
  );
};

export default LayerGap;
