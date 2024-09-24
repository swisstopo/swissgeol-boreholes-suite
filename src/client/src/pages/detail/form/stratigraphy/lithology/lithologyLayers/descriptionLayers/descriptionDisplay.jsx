import { useTranslation } from "react-i18next";
import { Stack, Typography } from "@mui/material";

const DescriptionDisplay = props => {
  const { item, layerHeight } = props;
  const { t, i18n } = useTranslation();

  const fontSize = layerHeight >= 5 ? 13 : (4 * layerHeight) / 1.1;

  return (
    <Stack direction="column" justifyContent="space-between">
      <Typography
        variant="subtitle1"
        sx={{
          fontSize: fontSize + "px",
        }}>
        {item.fromDepth} m MD
      </Typography>
      {layerHeight >= 10 && (
        <>
          <Typography
            sx={{
              fontWeight: "bold",
              overflow: "auto",
              display: "-webkit-box",
              WebkitLineClamp: "2",
              WebkitBoxOrient: "vertical",
            }}>
            {item.description}
          </Typography>
          {item.id !== null && (
            <Typography variant="subtitle2">
              {t("description_quality")}: {item.descriptionQuality?.[i18n.language] ?? "-"}
            </Typography>
          )}
        </>
      )}
      <Typography
        variant="subtitle1"
        sx={{
          fontSize: fontSize + "px",
        }}>
        {item.toDepth} m MD
      </Typography>
    </Stack>
  );
};
export default DescriptionDisplay;
