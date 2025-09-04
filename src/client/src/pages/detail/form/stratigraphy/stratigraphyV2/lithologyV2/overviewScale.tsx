import { theme } from "../../../../../../AppTheme.ts";
import { DepthScale } from "./depthScale.tsx";
import { LithologyLayers } from "./lithologyLayers.tsx";

export const OverviewScale = ({ lithologies }: { lithologies: Lithology[] }) => {
  return (
    <>
      <LithologyLayers
        lithologies={lithologies}
        displayText={false}
        colorAttribute={"lithologyCon"}
        sx={{ width: "45px", flexShrink: 0, pr: theme.spacing(1.5) }}
      />
      <DepthScale sx={{ width: "45px", flexShrink: 0, backgroundColor: "white" }} />
    </>
  );
};
