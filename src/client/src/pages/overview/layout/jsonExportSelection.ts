import { GridRowSelectionModel } from "@mui/x-data-grid";
import { ExportConfirmation } from "../../../components/export/exportDialog.tsx";

// JSON exports carry each borehole's full data, so they stay limited. The CSV export has no limit.
// Must match BoreholeJsonExportRequest.MaxBoreholeCount in the API, which rejects larger requests.
export const maxJsonExportCount = 500;

interface JsonExportSelection {
  ids: GridRowSelectionModel;
  confirmation?: ExportConfirmation;
}

/**
 * Picks the boreholes a JSON export delivers from the selection: the first {@link maxJsonExportCount}.
 * A larger selection asks for confirmation, as the export then leaves out the rest.
 */
export const getJsonExportSelection = (selection: GridRowSelectionModel): JsonExportSelection => ({
  ids: selection.slice(0, maxJsonExportCount),
  confirmation:
    selection.length > maxJsonExportCount
      ? { message: "exportJsonLimitedTo500", confirmLabel: "exportFirst500" }
      : undefined,
});
