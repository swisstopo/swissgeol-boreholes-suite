import { Stack } from "@mui/material";
import { DepthScale, TestLayersPanel } from "../stratigraphyV2/testComponents.tsx";
import { VerticalZoomPanWrapper } from "./VerticalZoomPanWrapper.tsx";

export const LithologyPanel = ({ stratigraphyId }: { stratigraphyId: number }) => {
  console.log(stratigraphyId);
  return (
    <VerticalZoomPanWrapper>
      <Stack direction={"row"} sx={{ height: "600px", width: "100%" }}>
        <DepthScale />
        <TestLayersPanel />
      </Stack>
    </VerticalZoomPanWrapper>
  );
};
