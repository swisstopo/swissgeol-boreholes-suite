import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Box, Button, Stack, Typography } from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { ArrowDownToLine, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import CopyIcon from "../../../assets/icons/copy.svg?react";
import { Boreholes, Filters, ReduxRootState, User } from "../../../api-lib/ReduxStateInterfaces.ts";
import { theme } from "../../../AppTheme.ts";
import { useAuth } from "../../../auth/useBdmsAuth.tsx";
import { BulkEditButton, CopyButton, DeleteButton, ExportButton } from "../../../components/buttons/buttons.tsx";
import { PromptContext } from "../../../components/prompt/promptContext.tsx";
import { OverViewContext } from "../overViewContext.tsx";
import WorkgroupSelect from "../sidePanelContent/commons/workgroupSelect.tsx";
import { BoreholeNumbersPreview } from "./boreholeNumbersPreview.tsx";

interface BottomBarProps {
  boreholes: Boreholes;
  selectionModel: GridRowSelectionModel;
  multipleSelected: (selection: GridRowSelectionModel, filter: Record<string, unknown>) => void;
  filters: Filters;
  onDeleteMultiple: () => void;
  onCopyBorehole: () => void;
  workgroup: number | null;
  setWorkgroup: Dispatch<SetStateAction<number | null>>;
  setIsExporting: Dispatch<SetStateAction<boolean>>;
}

const BottomBar = ({
  selectionModel,
  multipleSelected,
  onDeleteMultiple,
  filters,
  onCopyBorehole,
  boreholes,
  workgroup,
  setWorkgroup,
  setIsExporting,
}: BottomBarProps) => {
  const { t } = useTranslation();
  const { showPrompt, promptIsOpen } = useContext(PromptContext);
  const { bottomDrawerOpen, setBottomDrawerOpen } = useContext(OverViewContext);
  const user: User = useSelector((state: ReduxRootState) => state.core_user);
  const userIsEditor = user.data.roles.includes("EDIT");
  const auth = useAuth();
  const [copyPromptOpen, setCopyPromptOpen] = useState(false);
  const enabledWorkgroups = useMemo(
    () => user.data.workgroups.filter(w => w.disabled === null && w.roles.includes("EDIT")),
    [user.data.workgroups],
  );

  const showCopyPromptForSelectedWorkgroup = useCallback(() => {
    setCopyPromptOpen(true);
    showPrompt(
      "selectWorkgroupToCreateCopy",
      [
        {
          label: "cancel",
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
  }, [enabledWorkgroups, onCopyBorehole, setWorkgroup, showPrompt, workgroup]);

  //Ensures prompt content with the WorkgroupSelect is updated when a workgroup is selected.
  useEffect(() => {
    if (promptIsOpen && copyPromptOpen) showCopyPromptForSelectedWorkgroup();
    if (!promptIsOpen) setCopyPromptOpen(false);
  }, [copyPromptOpen, promptIsOpen, showCopyPromptForSelectedWorkgroup, workgroup]);

  function bulkEditSelected() {
    multipleSelected(selectionModel, filters.filter);
  }

  const showPromptExportMoreThan100 = (callback: () => void) => {
    showPrompt("bulkExportMoreThan100", [
      {
        label: "cancel",
      },
      {
        label: "export100Boreholes",
        icon: <ArrowDownToLine />,
        variant: "contained",
        action: callback,
      },
    ]);
  };

  const onExportMultiple = async () => {
    if (selectionModel.length > 100) {
      showPromptExportMoreThan100(() => {
        setIsExporting(true);
      });
    } else {
      setIsExporting(true);
    }
  };

  const showAllTableActions = !auth.anonymousModeEnabled && userIsEditor;

  return (
    <Stack
      direction="row"
      alignItems={"center"}
      sx={{
        boxShadow: 2,
        height: "68px",
        p: 2,
        backgroundColor: theme.palette.background.lightgrey,
        borderTop: ` 1px solid ${theme.palette.border.light}`,
      }}>
      {selectionModel.length > 0 ? (
        <Stack direction="row" spacing={1} alignItems="center">
          {showAllTableActions && (
            <DeleteButton
              color="secondary"
              onClick={() =>
                showPrompt(t("deleteBoreholesMessage", { count: selectionModel.length }), [
                  {
                    label: "cancel",
                  },
                  {
                    label: "delete",
                    icon: <Trash2 />,
                    variant: "contained",
                    action: onDeleteMultiple,
                  },
                ])
              }
            />
          )}
          {selectionModel.length === 1 && showAllTableActions && (
            <CopyButton color="secondary" onClick={() => showCopyPromptForSelectedWorkgroup()} />
          )}
          {showAllTableActions && <BulkEditButton label={"bulkEditing"} onClick={bulkEditSelected} />}
          <ExportButton label={"export"} onClick={() => onExportMultiple()} />
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
