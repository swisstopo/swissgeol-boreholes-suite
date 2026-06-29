import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Stack, Typography } from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { ArrowDownToLine, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import CopyIcon from "../../../assets/icons/copy.svg?react";
import { isEditorUser, useCurrentUser } from "../../../api/user.ts";
import { theme } from "../../../AppTheme.ts";
import { useAuth } from "../../../auth/useBoreholesAuth.tsx";
import { BulkEditButton, CopyButton, DeleteButton, ExportButton } from "../../../components/buttons/buttons.tsx";
import { PromptContext } from "../../../components/prompt/promptContext.tsx";
import WorkgroupSelect from "../sidePanelContent/commons/workgroupSelect.tsx";
import { useBoreholeUrlParams } from "../useBoreholeUrlParams.ts";
import { useUserWorkgroups } from "../UserWorkgroupsContext.tsx";
import { BoreholeNumbersPreview } from "./boreholeNumbersPreview.tsx";

interface BottomBarProps {
  totalCount: number;
  selectionModel: GridRowSelectionModel;
  onBulkEdit: () => void;
  onDeleteMultiple: () => void;
  onCopyBorehole: () => void;
  setIsExporting: Dispatch<SetStateAction<boolean>>;
}

const BottomBar = ({
  selectionModel,
  onBulkEdit,
  onDeleteMultiple,
  onCopyBorehole,
  totalCount,
  setIsExporting,
}: BottomBarProps) => {
  const { t } = useTranslation();
  const { showPrompt, promptIsOpen } = useContext(PromptContext);
  const { bottomDrawerOpen, setBottomDrawerOpen } = useBoreholeUrlParams();
  const { currentWorkgroupId } = useUserWorkgroups();
  const { data: user } = useCurrentUser();
  const userIsEditor = isEditorUser(user);
  const auth = useAuth();
  const [copyPromptOpen, setCopyPromptOpen] = useState(false);

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
      <WorkgroupSelect sx={{ pt: 6, pb: 3 }} />,
    );
  }, [onCopyBorehole, showPrompt]);

  //Ensures prompt content with the WorkgroupSelect is updated when a workgroup is selected.
  useEffect(() => {
    if (promptIsOpen && copyPromptOpen) showCopyPromptForSelectedWorkgroup();
    if (!promptIsOpen) setCopyPromptOpen(false);
  }, [copyPromptOpen, promptIsOpen, showCopyPromptForSelectedWorkgroup, currentWorkgroupId]);

  const showPromptExportMoreThan100 = (callback: () => void) => {
    showPrompt("exportMoreThan100", [
      {
        label: "cancel",
      },
      {
        label: "exportFirst100",
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
          {showAllTableActions && <BulkEditButton label={"bulkEditing"} onClick={onBulkEdit} />}
          <ExportButton label={"export"} onClick={() => onExportMultiple()} />
          <Typography variant="subtitle1"> {t("selectedCount", { count: selectionModel.length })}</Typography>
        </Stack>
      ) : (
        <BoreholeNumbersPreview boreholeCount={totalCount} />
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
