import { useContext, useEffect, useState } from "react";
import { BoreholeTable } from "./boreholeTable.tsx";
import BottomBar from "./bottomBar.tsx";
import { BottomDrawer } from "./bottomDrawer.tsx";
import { GridRowSelectionModel, GridSortModel } from "@mui/x-data-grid";
import { Boreholes } from "../../../api-lib/ReduxStateInterfaces.ts";
import { FilterContext } from "../sidePanelContent/filter/filterContext.tsx";
import { deleteBoreholes } from "../../../api-lib";

interface BottomBarContainerProps {
  boreholes: Boreholes;
  search: { filter: string };
  loadEditingBoreholes: (
    page: number,
    limit: number,
    filter: string,
    orderby: string,
    direction: string,
    featureIds: number[],
  ) => void;
  multipleSelected: (selection: GridRowSelectionModel, filter: string) => void;
  onHover: (id: string | null) => void;
}

const BottomBarContainer = ({
  boreholes,
  loadEditingBoreholes,
  multipleSelected,
  search,
  onHover,
}: BottomBarContainerProps) => {
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 100,
    page: 0,
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
    reloadBoreholes();
  }, [sortModel, paginationModel, search, loadEditingBoreholes, featureIds]);

  const reloadBoreholes = () => {
    loadEditingBoreholes(
      paginationModel.page + 1, // mui datagrid pagination starts at 0, whereas server pagination starts at 1
      paginationModel.pageSize,
      search.filter,
      sortModel[0]?.field || "",
      sortModel[0]?.sort === "asc" ? "ASC" : "DESC",
      featureIds,
    );
  };
  const toggleBottomDrawer = () => {
    setBottomDrawerOpen(!bottomDrawerOpen);
  };

  return (
    <>
      <BottomBar
        toggleBottomDrawer={toggleBottomDrawer}
        bottomDrawerOpen={bottomDrawerOpen}
        selectionModel={selectionModel}
        multipleSelected={multipleSelected}
        deleteMultiple={() => {
          // @ts-expect-error legacy api calls not typed
          deleteBoreholes(selectionModel).then(() => {
            reloadBoreholes();
          });
        }}
        search={search}
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
          onHover={onHover}
        />
      </BottomDrawer>
    </>
  );
};

export default BottomBarContainer;
