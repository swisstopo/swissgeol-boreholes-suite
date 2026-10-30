// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RoleSelect } from "./roleSelect.tsx";

describe("RoleSelect", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the current role and offers every role", () => {
    render(<RoleSelect value="Editor" label="Role Ada Lovelace" disabled={false} onChange={vi.fn()} />);

    const select = screen.getByRole("combobox", { name: "Role Ada Lovelace" });
    expect(select.textContent).toBe("Editor");

    fireEvent.mouseDown(select);
    const options = screen.getAllByRole("option").map(option => option.textContent);
    expect(options).toEqual(["Reader", "Editor", "Reviewer", "Publisher"]);
  });

  it("reports the role picked from the list", () => {
    const onChange = vi.fn();
    render(<RoleSelect value="Editor" label="Role" disabled={false} onChange={onChange} />);

    fireEvent.mouseDown(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Publisher" }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith("Publisher");
  });

  it("cannot be opened when disabled", () => {
    render(<RoleSelect value="Editor" label="Role" disabled={true} onChange={vi.fn()} />);

    fireEvent.mouseDown(screen.getByRole("combobox"));

    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });
});
