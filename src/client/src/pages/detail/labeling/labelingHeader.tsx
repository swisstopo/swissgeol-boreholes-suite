import { FC, ReactNode, useContext, useEffect, useMemo, useState } from "react";
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

interface SelectionItem {
  key: number;
  value: string;
  startIcon?: ReactNode;
}

export const LabelingHeader: FC<{
  selectedAttachment: BoreholeAttachment | undefined;
  setSelectedAttachment: (file: BoreholeAttachment | undefined) => void;
  setActivePage: (page: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  files?: BoreholeAttachment[];
  showSearch?: boolean;
}> = ({ selectedAttachment, setSelectedAttachment, setActivePage, fileInputRef, files, showSearch }) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(DetailContext);
  const { panelTab, setPanelTab } = useContext(LabelingContext);
  const [search, setSearch] = useState("");

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const fileSelectionItems = useMemo(() => {
    const items =
      files
        ?.map(file => ({ key: file.id, value: getDisplayName(file) }) as SelectionItem)
        .filter(({ value }) => !search || value.includes(search)) ?? [];

    if (editingEnabled) {
      items.push({
        key: -1,
        value: panelTab === PanelTab.profile ? t("addProfile") : t("addPhoto"),
        startIcon: <Plus />,
      });
    }
    return items;
  }, [files, editingEnabled, search, panelTab, t]);

  useEffect(() => {
    setSearch("");
  }, [files, selectedAttachment]);

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
            search={showSearch ? search : undefined}
            onSearch={showSearch ? setSearch : undefined}
            sx={labelingButtonStyles}
          />
        </Stack>
      )}
    </Stack>
  );
};
