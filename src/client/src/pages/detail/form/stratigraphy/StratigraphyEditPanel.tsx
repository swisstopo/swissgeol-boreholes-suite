import { Dispatch, FC, RefObject, SetStateAction, useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Box, Stack } from "@mui/material";
import { theme } from "../../../../AppTheme.ts";
import { AddRowButton } from "../../../../components/buttons/buttons.tsx";
import { EditStateContext } from "../../editStateContext.tsx";
import { LayerAddButton } from "./components/layerAddButton.tsx";
import { LensColumn } from "./components/lensColumn/LensColumn.tsx";
import { StratigraphyTableHeaderCell } from "./components/stratigraphyTableHeaderCell.tsx";
import { StratigraphyTableHeader } from "./components/stratigraphyTablePrimitives.tsx";
import { HierarchicalDataEditProfileParts } from "./hierarchicalDataEditProfile.tsx";
import { DiscreteScale } from "./navigation/DiscreteScale.tsx";
import { NavigationChild } from "./navigation/NavigationChild.tsx";
import { NavigationContainer } from "./navigation/NavigationContainer.tsx";
import { NavState } from "./navigation/navState.ts";

type UseEditProfile = (args: {
  stratigraphyId: number;
  navState: NavState;
  setNavState: Dispatch<SetStateAction<NavState>>;
}) => HierarchicalDataEditProfileParts;

interface StratigraphyEditPanelProps {
  stratigraphyId: number;
  useEditProfile: UseEditProfile;
}

// CSS-grid layout: 45px lens column on the left, 1fr for the data table on the right. Four rows
// pin the lens-up button to the header row, the lens body to the scrollable data row, and the
// lens-down button to its own row (so it isn't stretched by the AddRowButton's height — that
// lives alone in the last row).
const gridSx = {
  display: "grid",
  gridTemplateColumns: "45px 1fr",
  gridTemplateRows: "auto 1fr auto auto",
  gridTemplateAreas: `
    "lens-up    header"
    "lens-body  body"
    "lens-down  ."
    ".          footer"
  `,
  columnGap: theme.spacing(1),
  minHeight: "65vh",
  height: "100%",
};

const bodyStackSx = {
  gridArea: "body",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "1px",
    backgroundColor: theme.palette.border.darker,
    pointerEvents: "none",
  },
  "& > *": { borderLeft: `1px solid ${theme.palette.border.darker}` },
  "& > *:last-child": { borderRight: `1px solid ${theme.palette.border.darker}` },
};

// Shared edit-panel layout for chronostratigraphy and lithostratigraphy. The two tabs differ
// only in which hierarchical-data edit profile they drive, so the variant-specific hook is
// passed in as `useEditProfile`.
export const StratigraphyEditPanel: FC<StratigraphyEditPanelProps> = ({ stratigraphyId, useEditProfile }) => {
  // navState.height must reflect only the body row (1fr) of the grid, not the whole grid: the
  // table-header, lens-down and footer rows are outside the body, and including them would inflate
  // pixelPerMeter so the bottom of the data clips inside `overflow: hidden`.
  const bodyRef = useRef<HTMLDivElement>(null);
  return (
    <NavigationContainer
      sx={gridSx}
      bodyRef={bodyRef}
      renderItems={(navState, setNavState) => (
        <StratigraphyEditPanelContent
          stratigraphyId={stratigraphyId}
          navState={navState}
          setNavState={setNavState}
          bodyRef={bodyRef}
          useEditProfile={useEditProfile}
        />
      )}
    />
  );
};

interface StratigraphyEditPanelContentProps {
  stratigraphyId: number;
  navState: NavState;
  setNavState: Dispatch<SetStateAction<NavState>>;
  bodyRef: RefObject<HTMLDivElement | null>;
  useEditProfile: UseEditProfile;
}

const StratigraphyEditPanelContent: FC<StratigraphyEditPanelContentProps> = ({
  stratigraphyId,
  navState,
  setNavState,
  bodyRef,
  useEditProfile,
}) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(EditStateContext);

  const { headerCells, layerStack, handleAddLayer, depths } = useEditProfile({
    stratigraphyId,
    navState,
    setNavState,
  });
  return (
    <>
      <LensColumn stratigraphyId={stratigraphyId} navState={navState} setNavState={setNavState} />
      <StratigraphyTableHeader sx={{ gridArea: "header" }}>
        <StratigraphyTableHeaderCell sx={{ flex: "0 0 128px" }} label={t("depthMD")} />
        {headerCells}
      </StratigraphyTableHeader>
      <Stack ref={bodyRef} direction="row" sx={bodyStackSx}>
        <NavigationChild navState={navState} sx={{ flex: "0 0 128px" }}>
          <DiscreteScale navState={navState} depths={depths} />
        </NavigationChild>
        <NavigationChild navState={navState}>{layerStack}</NavigationChild>
      </Stack>
      {editingEnabled && (
        <Box sx={{ mt: 1.5 }}>
          {/*Temporary add button position until the editing view is adapted*/}
          {/* https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2301*/}
          {/* https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2300*/}
          <AddRowButton onClick={handleAddLayer} dataCy="add-layer-button" buttonContent={<LayerAddButton />} />
        </Box>
      )}
    </>
  );
};
