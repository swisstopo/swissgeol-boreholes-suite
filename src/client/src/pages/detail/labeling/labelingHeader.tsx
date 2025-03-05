import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Stack } from "@mui/material";
import { FileIcon, Plus } from "lucide-react";
import { File as FileInterface } from "../../../api/file/fileInterfaces.ts";
import { theme } from "../../../AppTheme.ts";
import { ButtonSelect } from "../../../components/buttons/buttonSelect.tsx";
import { labelingButtonStyles } from "./labelingStyles.ts";

export const LabelingHeader: FC<{
  selectedFile: FileInterface | undefined;
  setSelectedFile: (file: FileInterface | undefined) => void;
  setActivePage: (page: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  files?: FileInterface[];
}> = ({ selectedFile, setSelectedFile, setActivePage, fileInputRef, files }) => {
  const { t } = useTranslation();

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Stack alignItems="flex-end" p={2} sx={{ backgroundColor: theme.palette.ai.header }} data-cy="labeling-header">
      {selectedFile && (
        <ButtonSelect
          fieldName="labeling-file"
          startIcon={<FileIcon />}
          items={[
            ...(files?.map((file: FileInterface) => ({ key: file.id, value: file.name })) || []),
            { key: -1, value: t("addFile"), startIcon: <Plus /> },
          ]}
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
