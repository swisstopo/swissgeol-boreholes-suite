import { FC, useContext, useEffect, useState } from "react";
import { BoreholeTable } from "./boreholeTable.tsx";
import { useLocation } from "react-router-dom";
import { PromptContext } from "../../components/prompt/promptContext.tsx";
import { useTranslation } from "react-i18next";
import TrashIcon from "../../assets/icons/trash.svg?react";
import { copyBorehole } from "../../api/fetchApiV2";
import { BoreholesContext } from "../boreholesContext.tsx";
import { deleteBorehole, deleteBoreholes, loadEditingBoreholes } from "../../api-lib";
import { AlertContext } from "../../components/alert/alertContext.tsx";
import { useDispatch, useSelector } from "react-redux";
import { DrawerContentTypes } from "./overviewPageInterfaces.ts";
import { ReduxRootState } from "../../api-lib/ReduxStateInterfaces.ts";
import { BottomDrawer } from "./layout/bottomDrawer.tsx";
import { LayoutBox, MainContentBox, SidebarBox } from "../../components/styledComponents.js";
import FilterComponent from "./sidePanelContent/filter/filterComponent";
import NewBoreholePanel from "./sidePanelContent/newBoreholePanel.tsx";
import CustomLayersPanel from "./sidePanelContent/customLayers/customLayersPanel";
import MainSideNav from "./layout/mainSideNav.tsx";
import { SideDrawer } from "./layout/sideDrawer.tsx";
import MapComponent from "../../components/map/mapComponent";
import BottomBar from "./layout/bottomBar.tsx";
import { FilterContext } from "./sidePanelContent/filter/filterContext.tsx";

export const Wip_overviewPage: FC = () => {
  const { t } = useTranslation();
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
  const location = useLocation();
  const [sideDrawerContent, setSideDrawerContent] = useState(DrawerContentTypes.Filters);

  const {
    filterPolygon,
    setFilterPolygon,
    polygonSelectionEnabled,
    setPolygonSelectionEnabled,
    featureIds,
    setFeatureIds,
  } = useContext(FilterContext);
  const { showPrompt } = useContext(PromptContext);
  const { showAlert } = useContext(AlertContext);
  const { setIsFetching, setBoreholeCount, setLoadedBoreholes, paginationModel, sortModel, selectionModel } =
    useContext(BoreholesContext);

  const filter = useSelector((state: ReduxRootState) => state.filters);

  const loadBoreholes = async () => {
    setIsFetching(true);

    useDispatch(
      loadEditingBoreholes(
        paginationModel.page,
        paginationModel.pageSize,
        filter,
        sortModel.length > 0 ? sortModel[0].field : null,
        sortModel.length > 0 ? sortModel[0].sort : null,
        featureIds,
      ),
    );
  };

  const toggleSideDrawer = (open: boolean) => {
    setSideDrawerOpen(open);
  };

  const toggleBottomDrawer = (open: boolean) => {
    setBottomDrawerOpen(open);
  };

  const deleteSelected = async () => {
    setIsFetching(true);
    let response;
    if (selectionModel.length === 1) {
      response = await deleteBorehole(selectionModel[0] as number);
    } else {
      response = await deleteBoreholes(selectionModel.map(id => id as number));
    }

    // TODO: Reload boreholes on success, else display error message

    loadBoreholes();
  };

  const duplicateSelected = async (workgroupId: number) => {
    const response = await copyBorehole(selectionModel[0], workgroupId);

    if (!response.ok) {
      // TODO: Display error message
    }
    // TODO: Open the detail view of the copied borehole
  };

  const downloadSelected = () => {
    // TODO: Handle download
  };

  const bulkEditSelected = () => {
    // TODO: Open modal for bulk editing
  };

  const sideDrawerComponentMap = {
    filters: <FilterComponent toggleDrawer={toggleSideDrawer} />,
    newBorehole: <NewBoreholePanel toggleDrawer={toggleSideDrawer} />,
    customLayers: <CustomLayersPanel toggleDrawer={toggleSideDrawer} />,
  };
  useEffect(() => {
    // Close the side drawer when the route changes
    setSideDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    loadBoreholes();
  }, []);

  return (
    <LayoutBox>
      <SidebarBox>
        <MainSideNav
          toggleDrawer={toggleSideDrawer}
          drawerOpen={sideDrawerOpen}
          setSideDrawerContent={setSideDrawerContent}
          sideDrawerContent={sideDrawerContent}
        />
      </SidebarBox>
      <SideDrawer drawerOpen={sideDrawerOpen} drawerContent={sideDrawerComponentMap[sideDrawerContent]} />
      <MainContentBox>
        <MapComponent
          highlighted={() => {
            //this.state.hover !== null ? [this.state.hover.id] : []}
            return false;
          }}
          hover={id => {
            // TODO: Fix this
            // this.setState({
            //   maphover: id,
            // });
          }}
          selected={id => {
            // TODO: Fix this
            // if (id !== null) {
            //   lock(id);
            // }
          }}
          polygonSelectionEnabled={polygonSelectionEnabled}
          setPolygonSelectionEnabled={setPolygonSelectionEnabled}
          filterPolygon={filterPolygon}
          setFilterPolygon={setFilterPolygon}
          setFeatureIds={setFeatureIds}
          displayErrorMessage={(message: string) => {
            showAlert(message, "error");
          }}
        />
        <BottomBar
          toggleBottomDrawer={toggleBottomDrawer}
          bottomDrawerOpen={bottomDrawerOpen}
          deleteSelected={() => {
            showPrompt(t("deleteBoreholeMessage"), [
              {
                label: t("cancel"),
              },
              {
                label: t("delete"),
                icon: <TrashIcon />,
                variant: "contained",
                action: () => {
                  deleteSelected();
                },
              },
            ]);
          }}
          duplicateSelected={() => {
            // TODO: Show prompt to select workgroup
            // duplicateSelected(workgroupId);
          }}
          downloadSelected={downloadSelected}
          bulkEditSelected={bulkEditSelected}
        />
        <BottomDrawer drawerOpen={bottomDrawerOpen}>
          <BoreholeTable
            highlightRow={null}
            onHoverRow={id => {
              // TODO:
            }}
          />
        </BottomDrawer>
      </MainContentBox>
    </LayoutBox>
  );
};
