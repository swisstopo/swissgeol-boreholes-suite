import { useContext, useEffect, useState } from "react";
import { BoreholeTable } from "./boreholeTable.tsx";
import BottomBar from "./bottomBar.tsx";
import { BottomDrawer } from "./bottomDrawer.tsx";
import { GridRowSelectionModel, GridSortModel } from "@mui/x-data-grid";
import { Boreholes } from "../../../api-lib/ReduxStateInterfaces.ts";
import { FilterContext } from "../sidePanelContent/filter/filterContext.tsx";

interface BottomBarContainerProps {
  boreholes: Boreholes;
  search: { filter: string };
  loadEditingBoreholes: (
    page: number,
    filter: string,
    orderby: string,
    direction: string,
    featureIds: number[],
  ) => void;
}

const BottomBarContainer = ({ boreholes, loadEditingBoreholes, search }: BottomBarContainerProps) => {
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 100,
    page: 1,
  });
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: "original_name",
      sort: "desc",
    },
  ]);
  const { featureIds } = useContext(FilterContext);

  useEffect(() => {
    loadEditingBoreholes(
      paginationModel.page || 1,
      search.filter,
      sortModel[0]?.field || "",
      sortModel[0]?.sort === "asc" ? "ASC" : "DESC",
      featureIds,
    );
  }, [sortModel, paginationModel, search, loadEditingBoreholes, featureIds]);

  const toggleBottomDrawer = () => {
    setBottomDrawerOpen(!bottomDrawerOpen);
  };

  return (
    <>
      <BottomBar
        toggleBottomDrawer={toggleBottomDrawer}
        bottomDrawerOpen={bottomDrawerOpen}
        selectionModel={selectionModel}
        boreholes={boreholes}
      />
      <BottomDrawer drawerOpen={bottomDrawerOpen}>
        <BoreholeTable
          boreholes={boreholes}
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          selectionModel={selectionModel}
          setSelectionModel={setSelectionModel}
          sortModel={sortModel}
          setSortModel={setSortModel}
          highlightRow={null}
          onHoverRow={() => {}}
        />
      </BottomDrawer>
    </>
  );
};

export default BottomBarContainer;
