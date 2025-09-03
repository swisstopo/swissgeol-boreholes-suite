import { Box, Stack } from "@mui/material";
import { useLithologies } from "../../lithology.ts";
import { VerticalZoomPanWrapper } from "./VerticalZoomPanWrapper.tsx";

export const LithologyPanel = ({ stratigraphyId }: { stratigraphyId: number }) => {
  const { data: lithologies, isLoading } = useLithologies(stratigraphyId);

  if (isLoading || lithologies?.length === 0) return null;

  return (
    <>
      <Box sx={{ position: "relative", width: "100%" }}>Headers</Box>
      <VerticalZoomPanWrapper>
        <Stack direction={"row"} spacing={1.5} sx={{ height: "600px", width: "100%" }} justifyContent={"flex-start"}>
          {lithologies?.map(l => l.id)}
        </Stack>
      </VerticalZoomPanWrapper>
    </>
  );
};
