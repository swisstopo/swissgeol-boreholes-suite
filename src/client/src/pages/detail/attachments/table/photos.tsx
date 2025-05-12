import { ChangeEvent, FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox, Stack, Typography } from "@mui/material";
import { GridColDef, GridColumnHeaderParams, GridRenderCellParams, GridRowId, useGridApiRef } from "@mui/x-data-grid";
import { CheckIcon } from "lucide-react";
import {
  deletePhotos,
  exportPhotos,
  getPhotosByBoreholeId,
  updatePhotos,
  uploadPhoto,
} from "../../../../api/fetchApiV2.ts";
import DateText from "../../../../components/legacyComponents/dateText";
import { DetailContext } from "../../detailContext.tsx";
import { SaveContext, SaveContextProps } from "../../saveContext.tsx";
import { AttachmentContent } from "../attachmentsContent.tsx";

interface PhotosProps {
  boreholeId: number;
}

export const Photos: FC<PhotosProps> = ({ boreholeId }) => {
  const { t } = useTranslation();
  const apiRef = useGridApiRef();
  const { editingEnabled } = useContext(DetailContext);
  const { hasChanges, markAsChanged } = useContext<SaveContextProps>(SaveContext);

  const [updatedRows, setUpdatedRows] = useState<Map<GridRowId, boolean>>(new Map());
  const [allPhotosPublic, setAllPhotosPublic] = useState(false);
  const [somePhotosPublic, setSomePhotosPublic] = useState(false);

  const loadPhotos = useCallback(() => {
    return getPhotosByBoreholeId(boreholeId);
  }, [boreholeId]);

  const addPhoto = async (file: File) => {
    await uploadPhoto(boreholeId, file);
  };

  const deleteAttachments = async (ids: number[]) => {
    await deletePhotos(ids);
  };

  const exportAttachments = async (ids: number[]) => {
    await exportPhotos(ids);
  };

  const togglePublicValueForRow = useCallback(
    (id: GridRowId, checked: boolean) => {
      setUpdatedRows(prevRows => {
        const newMap = new Map(prevRows);
        newMap.set(id, checked);
        return newMap;
      });
      apiRef.current.updateRows([{ id, public: checked }]);
    },
    [apiRef],
  );

  const toggleAllPublicValues = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      const currentRows = apiRef.current.getRowModels();
      Array.from(currentRows.keys()).forEach(id => {
        togglePublicValueForRow(id, checked);
      });
    },
    [apiRef, togglePublicValueForRow],
  );

  const updateAttachments = useCallback(async () => {
    const updatedRowsArray = Array.from(updatedRows.entries()).map(([key, value]) => ({
      id: key as number,
      public: value,
    }));
    updatePhotos(updatedRowsArray);
  }, [updatedRows]);

  useEffect(() => {
    if (updatedRows.size > 0 && !hasChanges) {
      markAsChanged(true);
    }
  }, [hasChanges, markAsChanged, updatedRows]);

  useEffect(() => {
    if (apiRef.current.getRowModels) {
      const currentRows = apiRef.current.getRowModels();
      setAllPhotosPublic(Array.from(currentRows.values()).every(row => row.public));
      setSomePhotosPublic(Array.from(currentRows.values()).some(row => row.public));
    }
  }, [apiRef, updatedRows]);

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "name",
        headerName: t("name"),
      },
      {
        field: "created",
        headerName: t("uploaded"),
        resizable: false,
        width: 150,
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
        resizable: false,
        width: 150,
        valueGetter: (value, row) => `${row.fromDepth} - ${row.toDepth}`,
      },
      {
        field: "public",
        headerName: t("public"),
        type: "boolean",
        editable: editingEnabled,
        resizable: false,
        width: 150,
        renderHeader: editingEnabled
          ? (params: GridColumnHeaderParams) => (
              <Stack flexDirection="row" justifyContent="flex-start" alignItems="center" gap={1}>
                <Checkbox
                  checked={allPhotosPublic}
                  indeterminate={somePhotosPublic && !allPhotosPublic}
                  onChange={toggleAllPublicValues}
                />
                <Typography sx={{ fontSize: "16px", fontWeight: 500 }}>{params.colDef.headerName}</Typography>
              </Stack>
            )
          : undefined,
        renderCell: (params: GridRenderCellParams) => (
          <Stack flexDirection="row" alignItems="center" justifyContent="flex-start" width="100%">
            {editingEnabled ? (
              <Checkbox
                checked={params.row.public}
                onChange={event => togglePublicValueForRow(params.row.id, event.target.checked)}
              />
            ) : params.value ? (
              <CheckIcon />
            ) : null}
          </Stack>
        ),
      },
    ],
    [t, editingEnabled, allPhotosPublic, somePhotosPublic, toggleAllPublicValues, togglePublicValueForRow],
  );

  return (
    <AttachmentContent
      apiRef={apiRef}
      columns={columns}
      addAttachment={addPhoto}
      acceptedFileTypes="image/*"
      getAttachments={loadPhotos}
      deleteAttachments={deleteAttachments}
      exportAttachments={exportAttachments}
      saveChanges={updateAttachments}
      resetChanges={() => setUpdatedRows(new Map())}
      addAttachmentButtonLabel="addPhoto"
      noAttachmentsText="noPhotos"
    />
  );
};
