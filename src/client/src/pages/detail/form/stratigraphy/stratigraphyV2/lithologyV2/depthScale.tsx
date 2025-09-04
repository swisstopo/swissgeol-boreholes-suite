import { FC } from "react";
import { Box, Typography } from "@mui/material";
import { useScaleContext } from "./scaleContext.tsx";

export const DepthScale: FC = ({ sx }) => {
  const { scaleY } = useScaleContext();
  const pxPerMeter = 20; // Fixed value

  const markers = [];
  const step = 1; // Fixed step size // adapt based on view level!
  const maxDepth = 45; // set according to the max depth of the Layers stacks

  for (let depth = 0; depth <= maxDepth; depth += step) {
    const yPosition = depth * pxPerMeter;

    markers.push(
      <Box
        key={depth}
        sx={{
          position: "absolute",
          top: `${yPosition}px`,
          width: "100%",
          height: "1px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          pr: 1,
        }}>
        <Typography
          variant="caption"
          sx={{
            transform: `scaleY(${1 / scaleY})`,
            transformOrigin: "center",
            bgcolor: "white",
            px: 0.5,
          }}>
          {depth}m
        </Typography>
      </Box>,
    );
  }

  return <Box sx={{ position: "relative", height: "100%", width: "100%", ...sx }}>{markers}</Box>;
};
