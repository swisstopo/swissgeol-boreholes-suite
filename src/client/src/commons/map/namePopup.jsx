import { Box, Typography } from "@mui/material";

const NamePopup = ({ state: { hover } }) => {
  const hoverName = hover?.get("name");
  const hoverLength = hover?.get("length");

  return (
    <Box display="none">
      <Box className="ol-popup" id="popup-overlay">
        <Box flex={1}>
          <Typography noWrap>{hoverName || null}</Typography>
          {hoverLength !== null && hoverLength !== undefined ? (
            <Typography noWrap>{hoverLength + " m"}</Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default NamePopup;
