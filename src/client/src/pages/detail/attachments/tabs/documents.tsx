import { FC, useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, TextField, Typography } from "@mui/material";
import { GridColDef, GridRenderCellParams, GridRowId, useGridApiRef } from "@mui/x-data-grid";
import { Document, DocumentUpdate } from "../../../../api/apiInterfaces.ts";
import {
  createDocument,
  deleteDocuments,
  getDocumentsByBoreholeId,
  updateDocuments,
} from "../../../../api/fetchApiV2.ts";
import { useApiErrorAlert } from "../../../../hooks/useShowAlertOnError.tsx";
import { formatDate } from "../../../../utils.ts";
import { EditStateContext } from "../../editStateContext.tsx";
import { AttachmentContent } from "../attachmentsContent.tsx";
import { useAttachments } from "../useAttachments.tsx";

interface DocumentsProps {
  boreholeId: number;
}

export const Documents: FC<DocumentsProps> = ({ boreholeId }) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(EditStateContext);
  const apiRef = useGridApiRef();
  const showApiErrorAlert = useApiErrorAlert();

  const loadAttachments = useCallback(async () => {
    return await getDocumentsByBoreholeId(boreholeId);
  }, [boreholeId]);

  const addAttachment = async () => {
    await createDocument({ boreholeId, url: "", description: "", public: false } as Document);
  };

  const deleteAttachments = async (ids: number[]) => {
    await deleteDocuments(ids);
  };

  const exportAttachments = async () => {};

  const updateAttachments = useCallback(
    async (updatedRows: Map<GridRowId, Document>) => {
      const updatedRowsArray = Array.from(updatedRows.entries())
        .map<DocumentUpdate | undefined>(([key, value]) => {
          const data = apiRef.current.getRowWithUpdatedValues(key, "url");
          if (data) {
            return {
              id: key as number,
              url: value.url ?? data.url,
              description: value.description ?? data.description,
              public: value.public ?? false,
            };
          }
          return undefined;
        })
        .filter((row): row is DocumentUpdate => row !== undefined);
      try {
        await updateDocuments(updatedRowsArray);
        return true;
      } catch (error) {
        showApiErrorAlert(error);
        return false;
      }
    },
    [apiRef, showApiErrorAlert],
  );

  const { isLoading, rows, onAdd, onDelete, getPublicColumnHeader, getPublicColumnCell, updatedRows, setUpdatedRows } =
    useAttachments<Document>({
      apiRef,
      loadAttachments,
      addAttachment,
      deleteAttachments,
      exportAttachments,
      updateAttachments,
      tabStatusToReset: "documents",
    });

  const updateRow = useCallback(
    (id: GridRowId, values: Partial<Document>) => {
      setUpdatedRows(prevRows => {
        const newMap = new Map(prevRows);
        const row =
          newMap.get(id) ?? rows?.find(r => r.id === id) ?? ({ url: "", description: "", public: false } as Document);
        const updatedRow = { ...row, ...values };
        newMap.set(id, updatedRow);
        return newMap;
      });
    },
    [rows, setUpdatedRows],
  );

  const getUrlField = useCallback(
    (params: GridRenderCellParams<Document>, focused: boolean) => {
      const value = updatedRows.get(params.id)?.url ?? params.value ?? "";
      return (
        <TextField
          data-cy="document-url"
          multiline
          type="url"
          required
          {...(focused ? { defaultValue: value } : { value })}
          onChange={event => updateRow(params.id, { url: event.target.value })}
        />
      );
    },
    [updateRow, updatedRows],
  );

  const getDescriptionField = useCallback(
    (params: GridRenderCellParams<Document>, focused: boolean) => {
      const value = updatedRows.get(params.id)?.description ?? params.value ?? "";
      return (
        <TextField
          data-cy="document-description"
          multiline
          {...(focused ? { defaultValue: value } : { value })}
          onChange={event => updateRow(params.id, { description: event.target.value })}
        />
      );
    },
    [updateRow, updatedRows],
  );

  const columns = useMemo<GridColDef<Document>[]>(
    () => [
      {
        field: "url",
        headerName: t("url"),
        editable: editingEnabled,
        flex: 1,
        renderCell: params =>
          editingEnabled ? (
            getUrlField(params, false)
          ) : (
            <Link href={params.value} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: "break-all" }}>
              {params.value}
            </Link>
          ),
        renderEditCell: params => getUrlField(params, true),
      },
      {
        field: "description",
        headerName: t("description"),
        editable: editingEnabled,
        flex: 1,
        renderCell: params => {
          return editingEnabled ? (
            getDescriptionField(params, false)
          ) : (
            <Typography sx={{ whiteSpace: "pre-line", wordBreak: "break-all" }}>{params.value}</Typography>
          );
        },
        renderEditCell: params => getDescriptionField(params, true),
      },
      {
        field: "created",
        headerName: t("enteredOn"),
        resizable: false,
        width: 160,
        renderCell: ({ row }) => formatDate(row.created, true),
      },
      {
        field: "createdBy",
        headerName: t("user"),
        flex: 0.25,
        valueGetter: (value, row) => row.createdBy?.name ?? "-",
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
    [t, getUrlField, editingEnabled, getDescriptionField, getPublicColumnHeader, getPublicColumnCell],
  );

  return (
    <AttachmentContent<Document>
      apiRef={apiRef}
      isLoading={isLoading}
      columns={columns}
      rows={rows}
      addAttachment={onAdd}
      deleteAttachments={onDelete}
      addAttachmentButtonLabel="addDocument"
      noAttachmentsText="noDocuments"
    />
  );
};
