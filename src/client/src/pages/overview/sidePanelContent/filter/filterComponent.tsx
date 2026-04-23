import { FC, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Accordion, AccordionDetails, AccordionSummary, Badge, Box, Button, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ChevronDown } from "lucide-react";
import Polygon from "../../../../assets/icons/polygon.svg?react";
import { ReduxRootState } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { theme } from "../../../../AppTheme.ts";
import { useAuth } from "../../../../auth/useBoreholesAuth.tsx";
import { SideDrawerHeader } from "../../layout/sideDrawerHeader.tsx";
import { useBoreholeUrlParams } from "../../useBoreholeUrlParams.ts";
import FilterChips from "./FilterChips.tsx";
import { attachmentSearchData } from "./filterData/attachmentSearchData.ts";
import { boreholeSearchData } from "./filterData/boreholeSearchData.ts";
import { FilterComponentProps, FilterInputConfig } from "./filterData/filterInterfaces.ts";
import { logSearchData } from "./filterData/logSearchData.ts";
import { FilterReset } from "./filterReset.tsx";
import { ListFilter } from "./listFilter.tsx";
import { PolygonFilterContext } from "./polygonFilterContext.tsx";
import { StatusFilter } from "./statusFilter.tsx";
import { WorkgroupFilter } from "./workgroupFilter.tsx";

const StyledAccordion = styled(Accordion)(() => ({
  marginBottom: "6px",
  borderRadius: "4px",
  boxShadow: "none !important",
  border: "none",
  padding: "12px, 16px, 12px, 16px",
  "&.MuiAccordion-root:before": {
    backgroundColor: theme.palette.background.default,
  },
}));

const StyledAccordionDetails = styled(AccordionDetails)(() => ({
  overflow: "visible",
  flexGrow: 1,
}));

export const FilterComponent: FC<FilterComponentProps> = ({ toggleDrawer, formMethods }) => {
  const { t } = useTranslation();
  const { filterPolygon, polygonSelectionEnabled, setPolygonSelectionEnabled, setFeatureIds, setFilterPolygon } =
    useContext(PolygonFilterContext);

  const { filterParams, setFilterField, resetFilter, setTableParams } = useBoreholeUrlParams();

  const user = useSelector((state: ReduxRootState) => state.core_user);
  const auth = useAuth();

  const [searchList, setSearchList] = useState<FilterInputConfig[]>([
    {
      id: 0,
      name: "workgroup",
      translationId: "workgroup",
      isSelected: false,
      searchData: [{ value: "workgroupId", hideShowAllFields: true }],
      isHidden: auth.anonymousModeEnabled,
    },
    {
      id: 1,
      name: "workflowStatus",
      translationId: "workflowStatus",
      isSelected: false,
      searchData: [{ value: "workflowStatus", hideShowAllFields: true }],
      isHidden: auth.anonymousModeEnabled,
    },
    {
      id: 2,
      name: "borehole",
      translationId: "borehole",
      isSelected: false,
      searchData: boreholeSearchData,
    },

    {
      id: 3,
      name: "log",
      translationId: "log",
      isSelected: false,
      searchData: logSearchData,
    },
    {
      id: 4,
      name: "attachments",
      translationId: "attachments",
      isSelected: false,
      searchData: attachmentSearchData,
    },
  ]);

  const handlePolygonFilterClick = () => {
    setPolygonSelectionEnabled(!polygonSelectionEnabled);
  };
  const handleFilterReset = () => {
    setPolygonSelectionEnabled(false);
    setFilterPolygon(null);
    setFeatureIds([]);
    formMethods.reset();
    resetFilter();
    setTableParams({ page: 0 });
  };

  return (
    <Stack direction="column" sx={{ height: "100%" }}>
      <SideDrawerHeader title={t("searchfilters")} toggleDrawer={toggleDrawer} />
      <FilterChips />
      <Box sx={{ flexGrow: 1, overflow: "auto", scrollbarGutter: "stable", paddingRight: `-${theme.spacing(3)}` }}>
        <Button
          onClick={() => {
            handlePolygonFilterClick();
          }}
          variant="text"
          data-cy="polygon-filter-button"
          sx={{
            backgroundColor:
              polygonSelectionEnabled && !filterPolygon
                ? theme.palette.background.filterItemActive
                : theme.palette.background.default,
            color:
              polygonSelectionEnabled && !filterPolygon
                ? theme.palette.primary.contrastText
                : theme.palette.primary.main,
            width: "100%",
            marginLeft: 0,
            height: "48px",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "flex-start",
            padding: 0,
          }}>
          <Polygon
            style={{
              marginLeft: "18px",
              marginRight: "14px",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color:
                polygonSelectionEnabled && !filterPolygon
                  ? theme.palette.primary.contrastText
                  : theme.palette.primary.main,
            }}>
            {t("polygon_selection")}
          </Typography>
          {filterPolygon !== null && (
            <Badge data-cy="polygon-filter-badge" badgeContent={1} sx={{ marginLeft: "18px" }} />
          )}
        </Button>
        {searchList?.map(filter => {
          const currentFilterInputConfig = searchList.find(l => l.name === filter.name);
          const activeFilterLength = Object.entries(filterParams).filter(([key, value]) =>
            currentFilterInputConfig?.searchData.some(d => d.value === key && value != null),
          )?.length;
          return filter.isHidden ? null : (
            <StyledAccordion key={filter.id} expanded={filter?.isSelected}>
              <AccordionSummary
                expandIcon={<ChevronDown />}
                onClick={() => {
                  setSearchList(previousSearchlist =>
                    previousSearchlist.map(obj =>
                      obj.id === filter.id ? { ...obj, isSelected: !obj.isSelected } : { ...obj, isSelected: false },
                    ),
                  );
                }}>
                <Typography variant="h6">{t(filter?.translationId)} </Typography>
                <Badge badgeContent={activeFilterLength} sx={{ marginLeft: "18px", marginTop: "10px" }} />
              </AccordionSummary>
              {filter?.name === "workgroup" && filter?.isSelected && (
                <StyledAccordionDetails>
                  <WorkgroupFilter
                    onChange={workgroup => {
                      setFilterField("workgroupId", workgroup === "all" ? null : [Number(workgroup)]);
                      setTableParams({ page: 0 });
                    }}
                    workgroups={user.data.workgroups}
                    selectedWorkgroup={
                      filterParams.workgroupId == null ? "all" : String((filterParams.workgroupId as number[])[0])
                    }
                  />
                </StyledAccordionDetails>
              )}
              {filter?.name === "workflowStatus" && filter?.isSelected && (
                <StyledAccordionDetails>
                  <StatusFilter
                    selectedRole={filterParams.workflowStatus == null ? "all" : (filterParams.workflowStatus as string)}
                    setFilterField={setFilterField}
                  />
                </StyledAccordionDetails>
              )}
              <StyledAccordionDetails>
                {!!currentFilterInputConfig && filter?.isSelected && (
                  <ListFilter inputConfig={currentFilterInputConfig} />
                )}
              </StyledAccordionDetails>
            </StyledAccordion>
          );
        })}
      </Box>
      <FilterReset reset={handleFilterReset} />
    </Stack>
  );
};
