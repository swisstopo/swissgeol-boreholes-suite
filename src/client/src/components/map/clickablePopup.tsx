import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import Feature from "ol/Feature";

interface ClickablePopupProps {
  features?: Feature[];
}

export const ClickablePopup: FC<ClickablePopupProps> = ({ features = [] }) => {
  const navigate = useNavigate();
  return (
    <Box display="none">
      <Box className="ol-popup" id="popup-overlay">
        {features?.length > 0 &&
          features.map(feature => {
            const featureId = feature.getId();
            const name = feature.get("name") ?? featureId;
            return (
              <Typography noWrap key={featureId} onClick={() => navigate("/" + featureId)} sx={{ cursor: "pointer" }}>
                {name}
              </Typography>
            );
          })}
      </Box>
    </Box>
  );
};
