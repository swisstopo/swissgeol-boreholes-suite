import { ChangeEvent, FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox, Stack, TextField, Typography } from "@mui/material";
import { GridColDef, GridColumnHeaderParams, GridRenderCellParams, GridRowId, useGridApiRef } from "@mui/x-data-grid";
import { CheckIcon } from "lucide-react";
import { detachFile, downloadFile, getFiles, uploadFile } from "../../../../api/file/file";
import { BoreholeFile } from "../../../../api/file/fileInterfaces";
import { theme } from "../../../../AppTheme.ts";
import DateText from "../../../../components/legacyComponents/dateText";
import { DetailContext } from "../../detailContext";
import { AttachmentContent } from "../attachmentsContent";

interface ProfilesProps {
  boreholeId: number;
}

export const Profiles: FC<ProfilesProps> = ({ boreholeId }) => {
  const { t } = useTranslation();
  const apiRef = useGridApiRef();
  const { editingEnabled } = useContext(DetailContext);

  const [updatedRows, setUpdatedRows] = useState<
    Map<
      GridRowId,
      {
        description?: string;
        public: boolean;
      }
    >
  >(new Map());
  const [allPhotosPublic, setAllPhotosPublic] = useState(false);
  const [somePhotosPublic, setSomePhotosPublic] = useState(false);

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

  const updateDescription = useCallback((id: GridRowId, description: string) => {
    setUpdatedRows(prevRows => {
      const newMap = new Map(prevRows);
      const row = newMap.get(id) ?? { public: false };
      row.description = description;
      newMap.set(id, row);
      return newMap;
    });
  }, []);

  const togglePublicValueForRow = useCallback((id: GridRowId, checked: boolean) => {
    setUpdatedRows(prevRows => {
      const newMap = new Map(prevRows);
      const row = newMap.get(id) ?? { public: false };
      row.public = checked;
      return newMap;
    });
  }, []);

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
        valueGetter: (value, row) => row.file.name,
      },
      {
        field: "description",
        headerName: t("description"),
        editable: editingEnabled,
        renderCell: (params: GridRenderCellParams) =>
          editingEnabled ? (
            <TextField
              sx={{ margin: 0 }}
              defaultValue={params.value}
              onChange={event => updateDescription(params.id, event.target.value)}
            />
          ) : (
            <Typography sx={{ fontSize: "16px", fontWeight: 400 }}>{params.value}</Typography>
          ),
        renderEditCell: (params: GridRenderCellParams) => (
          <TextField
            sx={{ margin: `0 ${theme.spacing(1)}` }}
            defaultValue={params.value}
            onChange={event => updateDescription(params.id, event.target.value)}
          />
        ),
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
        width: 125,
        flex: 0,
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
          <Stack flexDirection="row" alignItems="center" justifyContent="flex-start">
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
    [
      t,
      editingEnabled,
      updateDescription,
      allPhotosPublic,
      somePhotosPublic,
      toggleAllPublicValues,
      togglePublicValueForRow,
    ],
  );

  return (
    <AttachmentContent
      apiRef={apiRef}
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
