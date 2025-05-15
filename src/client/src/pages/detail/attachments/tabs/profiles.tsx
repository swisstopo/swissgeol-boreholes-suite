import { FC, useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TextField, Typography } from "@mui/material";
import { GridColDef, GridRenderCellParams, GridRowId, useGridApiRef } from "@mui/x-data-grid";
import { detachFile, downloadFile, getFiles, updateFile, uploadFile } from "../../../../api/file/file";
import { BoreholeFile } from "../../../../api/file/fileInterfaces";
import { theme } from "../../../../AppTheme.ts";
import DateText from "../../../../components/legacyComponents/dateText";
import { DetailContext } from "../../detailContext";
import { AttachmentContent } from "../attachmentsContent";
import { AttachmentWithPublicState, useAttachments } from "../useAttachments.tsx";

interface ProfilesProps {
  boreholeId: number;
}

interface Profile extends AttachmentWithPublicState {
  description?: string;
}

export const Profiles: FC<ProfilesProps> = ({ boreholeId }) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(DetailContext);
  const apiRef = useGridApiRef();

  const loadAttachments = useCallback(async () => {
    const files = await getFiles<BoreholeFile>(boreholeId);
    return files.map(boreholeFile => ({
      id: boreholeFile.fileId,
      ...boreholeFile,
    }));
  }, [boreholeId]);

  const addAttachment = async (file: File) => {
    await uploadFile(boreholeId, file);
  };

  const deleteAttachments = async (ids: number[]) => {
    const downloadPromises = ids.map(id => detachFile(boreholeId.toString(), id));
    await Promise.all(downloadPromises);
  };

  const exportAttachments = async (ids: number[]) => {
    const downloadPromises = ids.map(id => downloadFile(id));
    await Promise.all(downloadPromises);
  };

  const updateAttachments = useCallback(
    async (updatedRows: Map<GridRowId, Profile>) => {
      const updatePromises = Array.from(updatedRows.entries()).map(([id, row]) => {
        const data = apiRef.current.getRowWithUpdatedValues(id, "description");
        if (data) {
          return updateFile(
            boreholeId.toString(),
            id as number,
            row.description ?? data.description,
            row.public ?? data.public,
          );
        }
      });
      await Promise.all(updatePromises);
    },
    [apiRef, boreholeId],
  );

  const {
    isLoading,
    rows,
    onAdd,
    onDelete,
    onExport,
    getPublicColumnHeader,
    getPublicColumnCell,
    updatedRows,
    setUpdatedRows,
  } = useAttachments({
    apiRef,
    loadAttachments,
    addAttachment,
    deleteAttachments,
    exportAttachments,
    updateAttachments,
  });

  const updateDescription = useCallback(
    (id: GridRowId, description: string) => {
      setUpdatedRows(prevRows => {
        const newMap = new Map(prevRows);
        const row: Profile = newMap.get(id) ?? ({ description: "" } as Profile);
        row.description = description;
        newMap.set(id, row);
        return newMap;
      });
    },
    [setUpdatedRows],
  );

  const getDescriptionField = useCallback(
    (params: GridRenderCellParams) => (
      <TextField
        data-cy="profile-description"
        multiline
        sx={{ margin: 1 }}
        defaultValue={(updatedRows.get(params.id) as Profile)?.description ?? params.value ?? ""}
        onChange={event => updateDescription(params.id, event.target.value)}
      />
    ),
    [updateDescription, updatedRows],
  );

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "name",
        headerName: t("name"),
        flex: 0.5,
        valueGetter: (value, row) => row.file.name,
      },
      {
        field: "description",
        headerName: t("description"),
        editable: editingEnabled,
        flex: 1,
        renderCell: (params: GridRenderCellParams) =>
          editingEnabled ? (
            getDescriptionField(params)
          ) : (
            <Typography sx={{ margin: `${theme.spacing(1)} 0` }}>
              {params.value
                ? params.value.split("\n").map((line: string, i: number) => (
                    <span key={i}>
                      {line}
                      {i < params.value.split("\n").length - 1 && <br />}
                    </span>
                  ))
                : ""}
            </Typography>
          ),
        renderEditCell: params => getDescriptionField(params),
      },
      {
        field: "type",
        headerName: t("type"),
        flex: 0.5,
        valueGetter: (value, row) => row.file.type,
      },
      {
        field: "created",
        headerName: t("uploaded"),
        resizable: false,
        width: 150,
        renderCell: ({ row }) => <DateText date={row.attached} hours />,
      },
      {
        field: "createdBy",
        headerName: t("user"),
        flex: 0.5,
        valueGetter: (value, row) => row.user?.name ?? "-",
      },
      {
        field: "public",
        headerName: t("public"),
        type: "boolean",
        editable: editingEnabled,
        resizable: false,
        width: editingEnabled ? 150 : 100,
        renderHeader: getPublicColumnHeader,
        renderCell: getPublicColumnCell,
      },
    ],
    [t, editingEnabled, getPublicColumnHeader, getPublicColumnCell, getDescriptionField],
  );

  return (
    <AttachmentContent
      apiRef={apiRef}
      isLoading={isLoading}
      columns={columns}
      rows={rows}
      addAttachment={onAdd}
      deleteAttachments={onDelete}
      exportAttachments={onExport}
      addAttachmentButtonLabel="addProfile"
      noAttachmentsText="noProfiles"
    />
  );
};
