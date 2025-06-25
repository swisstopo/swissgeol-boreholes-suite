import { Stack, Typography } from "@mui/material";
import { formatNumberForDisplay } from "../../../../../../../components/form/formUtils.js";

const DescriptionDisplay = props => {
  const { item, layerHeight } = props;

  const fontSize = layerHeight >= 5 ? 13 : (4 * layerHeight) / 1.1;

  return (
    <Stack direction="column" justifyContent="space-between">
      <Typography
        variant="subtitle1"
        sx={{
          fontSize: fontSize + "px",
        }}>
        {formatNumberForDisplay(item.fromDepth)} m MD
      </Typography>
      {layerHeight >= 10 && (
        <Typography
          sx={{
            fontWeight: "bold",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: "2",
            WebkitBoxOrient: "vertical",
          }}>
          {item.description}
        </Typography>
      )}
      <Typography
        variant="subtitle1"
        sx={{
          fontSize: fontSize + "px",
        }}>
        {formatNumberForDisplay(item.toDepth)} m MD
      </Typography>
    </Stack>
  );
};
export default DescriptionDisplay;
