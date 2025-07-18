import { FC } from "react";
import { Box, Typography } from "@mui/material";
import Feature from "ol/Feature";
import { theme } from "../../AppTheme";
import { useBoreholesNavigate } from "../../hooks/useBoreholesNavigate.tsx";

interface ClickablePopupProps {
  features?: Feature[];
}

export const ClickablePopup: FC<ClickablePopupProps> = ({ features = [] }) => {
  const { navigateTo } = useBoreholesNavigate();
  return (
    <Box display="none">
      <Box className="ol-popup" id="popup-overlay">
        {features?.length > 0 &&
          features.map(feature => {
            const featureId = feature.getId();
            const name = feature.get("name") ?? featureId;
            return (
              <Typography
                noWrap
                key={featureId}
                onClick={() => navigateTo({ path: "/" + featureId })}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    color: theme.palette.primary.main,
                  },
                }}>
                {name}
              </Typography>
            );
          })}
      </Box>
    </Box>
  );
};
