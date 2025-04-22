import { FC, ReactNode, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Box, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { styled } from "@mui/system";
import { FileImageIcon, FileTextIcon, Plus } from "lucide-react";
import { BoreholeAttachment } from "../../../api/apiInterfaces.ts";
import { theme } from "../../../AppTheme.ts";
import { ButtonSelect } from "../../../components/buttons/buttonSelect.tsx";
import { DetailContext } from "../detailContext.tsx";
import { LabelingContext } from "./labelingContext.tsx";
import { PanelTab } from "./labelingInterfaces.tsx";
import { labelingButtonStyles } from "./labelingStyles.ts";

const getDisplayName = (file: BoreholeAttachment) => {
  if (!file) return "";
  if ("fromDepth" in file) {
    return `${file.fromDepth?.toFixed(2)} - ${file.toDepth?.toFixed(2)}`;
  }
  return file.name;
};

const DescriptionBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.action.disabled,
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  alignContent: "center",
}));

export const LabelingHeader: FC<{
  selectedAttachment: BoreholeAttachment | undefined;
  setSelectedAttachment: (file: BoreholeAttachment | undefined) => void;
  setActivePage: (page: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  files?: BoreholeAttachment[];
}> = ({ selectedAttachment, setSelectedAttachment, setActivePage, fileInputRef, files }) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(DetailContext);
  const { panelTab, setPanelTab } = useContext(LabelingContext);

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const fileSelectionItems: { key: number; value: string; startIcon?: ReactNode }[] =
    files?.map(file => ({ key: file.id, value: getDisplayName(file) })) ?? [];
  if (editingEnabled) fileSelectionItems.push({ key: -1, value: t("addFile"), startIcon: <Plus /> });

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      p={2}
      sx={{ backgroundColor: theme.palette.ai.header }}
      data-cy="labeling-header">
      <ToggleButtonGroup
        value={panelTab}
        onChange={(event, nextTab: PanelTab) => {
          if (nextTab) {
            setPanelTab(nextTab);
          }
        }}
        exclusive
        sx={labelingButtonStyles}>
        <ToggleButton value={PanelTab.profile} data-cy="labeling-tab-profile">
          <FileTextIcon style={{ marginRight: theme.spacing(1) }} />
          {t("profile")}
        </ToggleButton>
        <ToggleButton value={PanelTab.photo} data-cy="labeling-tab-photo">
          <FileImageIcon style={{ marginRight: theme.spacing(1) }} />
          {t("photo")}
        </ToggleButton>
      </ToggleButtonGroup>
      {selectedAttachment && (
        <Stack direction="row" gap={1}>
          {panelTab === PanelTab.photo && <DescriptionBox>{t("depthMD")}</DescriptionBox>}
          <ButtonSelect
            fieldName="labeling-file"
            items={fileSelectionItems}
            selectedItem={{ key: selectedAttachment?.id, value: getDisplayName(selectedAttachment) }}
            onItemSelected={item => {
              setActivePage(1);
              if (item.key === -1) handleFileInputClick();
              else setSelectedAttachment(files?.find(file => file.id === item.key));
            }}
            sx={labelingButtonStyles}
          />
        </Stack>
      )}
    </Stack>
  );
};
