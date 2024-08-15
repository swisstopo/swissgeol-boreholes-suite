import React, { useCallback, useContext, useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import ArrowDownIcon from "../../../assets/icons/arrow_down.svg?react";
import ArrowUpIcon from "../../../assets/icons/arrow_up.svg?react";
import TrashIcon from "../../../assets/icons/trash.svg?react";
import CopyIcon from "../../../assets/icons/copy.svg?react";
import { BoreholeNumbersPreview } from "./boreholeNumbersPreview.tsx";
import { useTranslation } from "react-i18next";
import { theme } from "../../../AppTheme.ts";
import { Boreholes, ReduxRootState, User } from "../../../api-lib/ReduxStateInterfaces.ts";
import { BulkEditButton, CopyButton, DeleteButton } from "../../../components/buttons/buttons.tsx";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { PromptContext } from "../../../components/prompt/promptContext.tsx";
import WorkgroupSelect from "../sidePanelContent/commons/workgroupSelect.tsx";
import { useSelector } from "react-redux";

interface BottomBarProps {
  toggleBottomDrawer: (open: boolean) => void;
  bottomDrawerOpen: boolean;
  boreholes: Boreholes;
  selectionModel: GridRowSelectionModel;
  multipleSelected: (selection: GridRowSelectionModel, filter: string) => void;
  search: { filter: string };
  onDeleteMultiple: () => void;
  onCopyBorehole: () => void;
  workgroup: number | null;
  setWorkgroup: React.Dispatch<React.SetStateAction<number | null>>;
}

const BottomBar = ({
  toggleBottomDrawer,
  bottomDrawerOpen,
  selectionModel,
  multipleSelected,
  onDeleteMultiple,
  search,
  onCopyBorehole,
  boreholes,
  workgroup,
  setWorkgroup,
}: BottomBarProps) => {
  const { t } = useTranslation();
  const { showPrompt, promptIsOpen } = useContext(PromptContext);
  const user: User = useSelector((state: ReduxRootState) => state.core_user);
  const [copyPromptOpen, setCopyPromptOpen] = useState(false);
  const [currentWorkgroup, setCurrentWorkgroup] = useState<number | null>(null);
  const enabledWorkgroups = user.data.workgroups.filter(
    w => w.disabled === null && !w.supplier && w.roles.includes("EDIT"),
  );

  const showCopyPromptForSelectedWorkgroup = useCallback(() => {
    setCopyPromptOpen(true);
    setCurrentWorkgroup(workgroup);
    if (workgroup != currentWorkgroup || !copyPromptOpen) {
      showPrompt(
        t("selectWorkgroupToCreateCopy"),
        [
          {
            label: t("cancel"),
          },
          {
            label: "copy",
            icon: <CopyIcon />,
            variant: "contained",
            action: onCopyBorehole,
          },
        ],
        <WorkgroupSelect workgroup={workgroup} enabledWorkgroups={enabledWorkgroups} setWorkgroup={setWorkgroup} />,
      );
    }
  }, [copyPromptOpen, currentWorkgroup, enabledWorkgroups, onCopyBorehole, setWorkgroup, showPrompt, t, workgroup]);

  //Ensures prompt content with the WorkgroupSelect is updated when a workgroup is selected.
  useEffect(() => {
    if (promptIsOpen && copyPromptOpen) showCopyPromptForSelectedWorkgroup();
    if (!promptIsOpen) setCopyPromptOpen(false);
  }, [copyPromptOpen, promptIsOpen, showCopyPromptForSelectedWorkgroup, workgroup]);

  function bulkEditSelected() {
    multipleSelected(selectionModel, search.filter);
  }

  return (
    <Stack
      direction="row"
      alignItems={"center"}
      sx={{
        height: "68px",
        p: 2,
        backgroundColor: theme.palette.background.lightgrey,
        borderTop: ` 1px solid ${theme.palette.border}`,
      }}>
      {selectionModel.length > 0 ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <DeleteButton
            label="delete"
            onClick={() =>
              showPrompt(t("deleteBoreholesMessage", { count: selectionModel.length }), [
                {
                  label: t("cancel"),
                },
                {
                  label: t("delete"),
                  icon: <TrashIcon />,
                  variant: "contained",
                  action: onDeleteMultiple,
                },
              ])
            }
          />
          {selectionModel.length === 1 && <CopyButton onClick={() => showCopyPromptForSelectedWorkgroup()} />}
          <BulkEditButton label={"bulkEditing"} onClick={bulkEditSelected} />
          <Typography variant="subtitle1"> {t("selectedCount", { count: selectionModel.length })}</Typography>
        </Stack>
      ) : (
        <BoreholeNumbersPreview isFetching={boreholes.isFetching} boreholeCount={boreholes.length} />
      )}
      <Box sx={{ flex: 1 }}></Box>
      <Button
        onClick={() => toggleBottomDrawer(!bottomDrawerOpen)}
        data-cy="showTableButton"
        sx={{ fontWeight: "normal", fontSize: "14px" }}
        endIcon={bottomDrawerOpen ? <ArrowDownIcon /> : <ArrowUpIcon />}>
        {bottomDrawerOpen ? t("hideTable") : t("showTable")}
      </Button>
    </Stack>
  );
};

export default BottomBar;
