import { FC, useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import { GridColDef, GridRenderCellParams, GridValidRowModel } from "@mui/x-data-grid";
import { CheckIcon } from "lucide-react";
import { getPhotosByBoreholeId, uploadPhoto } from "../../../../api/fetchApiV2.ts";
import DateText from "../../../../components/legacyComponents/dateText";
import { DetailContext } from "../../detailContext.tsx";
import { AttachmentContent } from "../attachmentsContent.tsx";

interface PhotosProps {
  boreholeId: number;
}

export const Photos: FC<PhotosProps> = ({ boreholeId }) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(DetailContext);

  const loadPhotos = useCallback(() => {
    return getPhotosByBoreholeId(boreholeId);
  }, [boreholeId]);

  const addPhoto = async (file: File) => {
    await uploadPhoto(boreholeId, file);
  };

  const deletePhotos = async (ids: number[]) => {
    await deletePhotos(ids);
  };

  const exportPhotos = async (ids: number[]) => {
    await exportPhotos(ids);
  };

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "name",
        headerName: t("name"),
      },
      {
        field: "created",
        headerName: t("uploaded"),
        renderCell: ({ row }) => <DateText date={row.created} hours />,
      },
      {
        field: "createdBy",
        headerName: t("user"),
        valueGetter: (value, row) => row.createdBy?.name ?? "-",
      },
      {
        field: "depth",
        headerName: t("depthMD"),
        valueGetter: (value, row) => `${row.fromDepth} - ${row.toDepth}`,
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
      addAttachment={addPhoto}
      acceptedFileTypes="image/*"
      getAttachments={loadPhotos}
      deleteAttachments={deletePhotos}
      exportAttachments={exportPhotos}
      addAttachmentButtonLabel="addPhoto"
      noAttachmentsText="noPhotos"
    />
  );
};
