import React from "react";
import { Box, Typography } from "@mui/material";
import { useScale } from "./lithologyV2/scaleContext.tsx";

/**
 * A simple scale component that shows depth markers
 */
export const DepthScale: React.FC = ({ sx }) => {
  const scaleY = useScale();
  const pxPerMeter = 20; // Fixed value matching TestLayersPanel

  // Generate depth markers
  const markers = [];
  const step = 1; // Fixed step size
  const maxDepth = 45; // Match TestLayers max depth

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

export const TestLayersPanel: React.FC = ({ sx }) => {
  const layers = [
    { id: 1, fromDepth: 0, toDepth: 5, color: "#FFD700", name: "Sand" },
    { id: 2, fromDepth: 5, toDepth: 12, color: "#A52A2A", name: "Clay" },
    { id: 3, fromDepth: 12, toDepth: 18, color: "#808080", name: "Silt" },
    { id: 4, fromDepth: 18, toDepth: 30, color: "#D3D3D3", name: "Gravel" },
    { id: 5, fromDepth: 30, toDepth: 45, color: "#CD853F", name: "Sandy Clay" },
  ];
  const scaleY = useScale();
  const pxPerMeter = 20;

  return (
    <Box sx={{ position: "relative", height: "100%", width: "100%", ...sx }}>
      {layers.map(layer => {
        const top = layer.fromDepth * pxPerMeter;
        const height = (layer.toDepth - layer.fromDepth) * pxPerMeter;
        return (
          <Box
            key={layer.id}
            sx={{
              position: "absolute",
              top: `${top}px`,
              height: `${height}px`,
              width: "100%",
              bgcolor: layer.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <Typography
              variant="body2"
              sx={{
                transform: `scaleY(${1 / scaleY})`,
                transformOrigin: "center",
              }}>
              {layer.name} ({layer.fromDepth}m - {layer.toDepth}m)
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};
