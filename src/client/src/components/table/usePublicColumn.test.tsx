// @vitest-environment jsdom
import { FC, useState } from "react";
import { DataGrid, GridColDef, GridRowId, useGridApiRef } from "@mui/x-data-grid";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { EditStateContext } from "../../pages/detail/editStateContext.tsx";
import { usePublicColumn } from "./usePublicColumn.tsx";

interface PublicRow {
  id: number;
  public: boolean;
}

interface PublicColumnGridProps {
  rows: PublicRow[];
}

// Hands the rows straight to the grid, as the photo and profile tabs do with their query data,
// so the hook only learns about new rows through the grid.
const PublicColumnGrid: FC<PublicColumnGridProps> = ({ rows }) => {
  const apiRef = useGridApiRef();
  const [updatedRows, setUpdatedRows] = useState(new Map<GridRowId, PublicRow>());
  const { getPublicColumnHeader, getPublicColumnCell } = usePublicColumn({ apiRef, updatedRows, setUpdatedRows });
  const columns: GridColDef<PublicRow>[] = [
    { field: "public", headerName: "public", renderHeader: getPublicColumnHeader, renderCell: getPublicColumnCell },
  ];
  return <DataGrid apiRef={apiRef} rows={rows} columns={columns} disableVirtualization />;
};

const editableGrid = (rows: PublicRow[]) => (
  <EditStateContext.Provider value={{ editingEnabled: true, setEditingEnabled: () => {} }}>
    <PublicColumnGrid rows={rows} />
  </EditStateContext.Provider>
);

const headerCheckbox = () => within(screen.getByRole("columnheader")).getByRole<HTMLInputElement>("checkbox");

const rowCheckboxes = () =>
  screen.getAllByRole("gridcell").map(cell => within(cell).getByRole<HTMLInputElement>("checkbox"));

describe("usePublicColumn", () => {
  afterEach(cleanup);

  it("leaves the header unchecked while the grid has no rows", () => {
    render(editableGrid([]));

    expect(headerCheckbox()).not.toBeChecked();
  });

  it("follows rows that reach the grid after it mounted empty", () => {
    const { rerender } = render(editableGrid([]));

    rerender(editableGrid([{ id: 1, public: false }]));
    expect(headerCheckbox()).not.toBeChecked();

    rerender(editableGrid([{ id: 1, public: true }]));
    expect(headerCheckbox()).toBeChecked();
  });

  it("marks the header indeterminate when only some rows are public", () => {
    render(
      editableGrid([
        { id: 1, public: true },
        { id: 2, public: false },
      ]),
    );

    expect(headerCheckbox()).not.toBeChecked();
    expect(headerCheckbox()).toHaveAttribute("data-indeterminate", "true");
  });

  it("checks the header once the last private row is made public", () => {
    render(
      editableGrid([
        { id: 1, public: false },
        { id: 2, public: true },
      ]),
    );

    fireEvent.click(rowCheckboxes()[0]);

    expect(headerCheckbox()).toBeChecked();
  });

  it("makes every row public from the header", () => {
    render(
      editableGrid([
        { id: 1, public: false },
        { id: 2, public: false },
      ]),
    );

    fireEvent.click(headerCheckbox());

    rowCheckboxes().forEach(checkbox => expect(checkbox).toBeChecked());
    expect(headerCheckbox()).toBeChecked();
  });
});
