import { FC } from "react";
import { Box, Typography } from "@mui/material";
import { useScaleContext } from "./scaleContext.tsx";

interface DepthScaleProps {
  maxDepth: number;
}
export const DepthScale: FC<DepthScaleProps> = ({ maxDepth }) => {
  const { scaleY } = useScaleContext();
  const pxPerMeter = 20; // Fixed value

  const markers = [];
  const step = 1; // Fixed step size // adapt based on view level!

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

  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        width: "45px",
        flexShrink: 0,
        backgroundColor: "white",
      }}>
      {markers}
    </Box>
  );
};
