import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Box, Button, Stack, Typography } from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import CopyIcon from "../../../assets/icons/copy.svg?react";
import { Boreholes, ReduxRootState, User } from "../../../api-lib/ReduxStateInterfaces.ts";
import { theme } from "../../../AppTheme.ts";
import { BulkEditButton, CopyButton, DeleteButton } from "../../../components/buttons/buttons.tsx";
import { PromptContext } from "../../../components/prompt/promptContext.tsx";
import { OverViewContext } from "../overViewContext.tsx";
import WorkgroupSelect from "../sidePanelContent/commons/workgroupSelect.tsx";
import { BoreholeNumbersPreview } from "./boreholeNumbersPreview.tsx";

interface BottomBarProps {
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
  const { bottomDrawerOpen, setBottomDrawerOpen } = useContext(OverViewContext);
  const user: User = useSelector((state: ReduxRootState) => state.core_user);
  const [copyPromptOpen, setCopyPromptOpen] = useState(false);
  const [currentWorkgroup, setCurrentWorkgroup] = useState<number | null>(null);
  const enabledWorkgroups = user.data.workgroups.filter(w => w.disabled === null && w.roles.includes("EDIT"));

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
        <WorkgroupSelect
          workgroupId={workgroup}
          enabledWorkgroups={enabledWorkgroups}
          setWorkgroupId={setWorkgroup}
          sx={{ pt: 6, pb: 3 }}
        />,
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
        boxShadow: 2,
        height: "68px",
        p: 2,
        backgroundColor: theme.palette.background.lightgrey,
        borderTop: ` 1px solid ${theme.palette.border}`,
      }}>
      {selectionModel.length > 0 ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <DeleteButton
            label="delete"
            color="secondary"
            onClick={() =>
              showPrompt(t("deleteBoreholesMessage", { count: selectionModel.length }), [
                {
                  label: t("cancel"),
                },
                {
                  label: t("delete"),
                  icon: <Trash2 />,
                  variant: "contained",
                  action: onDeleteMultiple,
                },
              ])
            }
          />
          {selectionModel.length === 1 && (
            <CopyButton color="secondary" onClick={() => showCopyPromptForSelectedWorkgroup()} />
          )}
          <BulkEditButton label={"bulkEditing"} onClick={bulkEditSelected} />
          <Typography variant="subtitle1"> {t("selectedCount", { count: selectionModel.length })}</Typography>
        </Stack>
      ) : (
        <BoreholeNumbersPreview isFetching={boreholes.isFetching} boreholeCount={boreholes.length} />
      )}
      <Box sx={{ flex: 1 }}></Box>
      <Button
        variant="text"
        color="secondary"
        onClick={() => setBottomDrawerOpen(!bottomDrawerOpen)}
        data-cy="showTableButton"
        sx={{ fontWeight: "normal", fontSize: "14px" }}
        endIcon={bottomDrawerOpen ? <ChevronDown /> : <ChevronUp />}>
        {bottomDrawerOpen ? t("hideTable") : t("showTable")}
      </Button>
    </Stack>
  );
};

export default BottomBar;
