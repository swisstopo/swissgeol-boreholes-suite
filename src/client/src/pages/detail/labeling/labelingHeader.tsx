import { FC, ReactNode, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { FileIcon, FileImageIcon, FileTextIcon, Plus } from "lucide-react";
import { File as FileInterface } from "../../../api/file/fileInterfaces.ts";
import { theme } from "../../../AppTheme.ts";
import { ButtonSelect } from "../../../components/buttons/buttonSelect.tsx";
import { DetailContext } from "../detailContext.tsx";
import { LabelingContext } from "./labelingContext.tsx";
import { PanelTab } from "./labelingInterfaces.tsx";
import { labelingButtonStyles } from "./labelingStyles.ts";

export const LabelingHeader: FC<{
  selectedFile: FileInterface | undefined;
  setSelectedFile: (file: FileInterface | undefined) => void;
  setActivePage: (page: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  files?: FileInterface[];
}> = ({ selectedFile, setSelectedFile, setActivePage, fileInputRef, files }) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(DetailContext);
  const { panelTab, setPanelTab } = useContext(LabelingContext);

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const fileSelectionItems: { key: number; value: string; startIcon?: ReactNode }[] =
    files?.map((file: FileInterface) => ({ key: file.id, value: file.name })) ?? [];
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
      {selectedFile && (
        <ButtonSelect
          fieldName="labeling-file"
          startIcon={<FileIcon />}
          items={fileSelectionItems}
          selectedItem={{ key: selectedFile?.id, value: selectedFile?.name }}
          onItemSelected={item => {
            setActivePage(1);
            if (item.key === -1) handleFileInputClick();
            else setSelectedFile(files?.find((file: FileInterface) => file.id === item.key));
          }}
          sx={labelingButtonStyles}
        />
      )}
    </Stack>
  );
};
