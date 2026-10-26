import { fireEvent, screen, within } from "@testing-library/react";
import { Role } from "../../../../api/generated";

export const openSelect = (dataCy: string) => {
  const select = document.querySelector<HTMLElement>(`[data-cy="${dataCy}"]`);
  if (!select) throw new Error(`The select "${dataCy}" is not rendered.`);
  fireEvent.mouseDown(within(select).getByRole("combobox"));
};

export const closeMenu = () => {
  fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" });
};

export const checkOptions = (dataCy: string, names: string[]) => {
  openSelect(dataCy);
  names.forEach(name => fireEvent.click(screen.getByRole("option", { name })));
  closeMenu();
};

export const chooseRole = (role: Role) => {
  openSelect("role-formSelect");
  fireEvent.click(screen.getByRole("option", { name: role }));
};
