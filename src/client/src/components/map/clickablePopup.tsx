import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import Feature from "ol/Feature";

interface ClickablePopupProps {
  features?: Feature[];
}

const ClickablePopup: FC<ClickablePopupProps> = ({ features = [] }) => {
  const navigate = useNavigate();
  return (
    <Box display="none">
      <Box className="ol-popup" id="popup-overlay">
        {features?.length > 0 &&
          features.map((feature, index) => {
            const name = feature.get("name") ?? feature.getId();
            return (
              <Typography noWrap key={index} onClick={() => navigate("/" + feature.getId())} sx={{ cursor: "pointer" }}>
                {name}
              </Typography>
            );
          })}
      </Box>
    </Box>
  );
};

export default ClickablePopup;
