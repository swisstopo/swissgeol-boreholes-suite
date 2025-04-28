import { FC, useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import { GridColDef, GridRenderCellParams, GridValidRowModel } from "@mui/x-data-grid";
import { CheckIcon } from "lucide-react";
import { detachFile, downloadFile, getFiles, uploadFile } from "../../../../api/file/file.ts";
import { BoreholeFile } from "../../../../api/file/fileInterfaces.ts";
import DateText from "../../../../components/legacyComponents/dateText";
import { DetailContext } from "../../detailContext.tsx";
import { AttachmentContent } from "../attachmentsContent.tsx";

interface ProfilesProps {
  boreholeId: number;
}

export const Profiles: FC<ProfilesProps> = ({ boreholeId }) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(DetailContext);

  const loadProfiles = useCallback(async () => {
    const files = await getFiles<BoreholeFile>(boreholeId);
    return files.map(boreholeFile => ({
      id: boreholeFile.fileId,
      ...boreholeFile,
    }));
  }, [boreholeId]);

  const addProfile = async (file: File) => {
    await uploadFile(boreholeId, file);
  };

  const deleteProfiles = async (ids: number[]) => {
    const downloadPromises = ids.map(id => detachFile(boreholeId.toString(), id));
    await Promise.all(downloadPromises);
  };

  const exportProfiles = async (ids: number[]) => {
    const downloadPromises = ids.map(id => downloadFile(id));
    await Promise.all(downloadPromises);
  };

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "name",
        headerName: t("name"),
        valueGetter: (value, row) => row.file.name,
      },
      {
        field: "description",
        headerName: t("description"),
        editable: editingEnabled,
      },
      {
        field: "type",
        headerName: t("type"),
        valueGetter: (value, row) => row.file.type,
      },
      {
        field: "created",
        headerName: t("uploaded"),
        renderCell: ({ row }) => <DateText date={row.attached} hours />,
      },
      {
        field: "createdBy",
        headerName: t("user"),
        valueGetter: (value, row) => row.user?.name ?? "-",
      },
      {
        field: "public",
        headerName: t("public"),
        type: "boolean",
        editable: editingEnabled,
        renderCell: (params: GridRenderCellParams) =>
          params.value ? (
            <Box display="flex" alignItems="center" justifyContent="center" width="100%">
              <CheckIcon />
            </Box>
          ) : null,
      },
    ],
    [t, editingEnabled],
  );

  return (
    <AttachmentContent
      columns={columns}
      addAttachment={addProfile}
      getAttachments={loadProfiles}
      deleteAttachments={deleteProfiles}
      exportAttachments={exportProfiles}
      addAttachmentButtonLabel="addProfile"
      noAttachmentsText="noProfiles"
    />
  );
};
