// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { Codelist } from "../../../../../../api/generated";
import { EditStateContext } from "../../../../editStateContext.tsx";
import { Lithology } from "../../stratigraphy.ts";
import { LithologyModal } from "./lithologyModal.tsx";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

const codelists: Codelist[] = [
  { id: 102, schema: "lithology_uncon_main", code: "LBo", en: "large block" },
  { id: 201, schema: "lithology_uncon_secondary", code: "bo", en: "with blocks" },
];

vi.mock("../../../../../../components/codelist.ts", async importOriginal => ({
  ...(await importOriginal<typeof import("../../../../../../components/codelist.ts")>()),
  useCodelists: () => ({ data: codelists }),
  useCodelistSchema: (schema: string) => ({ data: codelists.filter(codelist => codelist.schema === schema) }),
  useCodelistLabel: () => (codelist: Codelist) => codelist.en,
  useCodelistDisplayValues: () => (id: number) => ({ text: `code-${id}`, code: "" }),
}));

vi.mock("../../../../../../api/dataextraction.ts", () => ({
  useClassifyLithologicalDescription: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("./lithologyConsolidatedForm.tsx", () => ({ LithologyConsolidatedForm: () => null }));
vi.mock("./remarksFormSection.tsx", () => ({ RemarksFormSection: () => null }));

const lithology: Lithology = {
  id: 1,
  stratigraphyId: 1,
  fromDepth: 0,
  toDepth: 10,
  isUnconsolidated: true,
  hasBedding: false,
  lithologyDescriptions: [
    { id: 1, lithologyId: 1, isFirst: true, lithologyUnconMainId: 102, lithologyUncon2Id: 201, lithologyUncon3Id: 201 },
  ],
};

const unconInput = (field: string) =>
  document.querySelector<HTMLInputElement>(`[data-cy="lithologyDescriptions.0.${field}-formSelect"] input`)!;

const selectOption = async (field: string, optionName: string) => {
  fireEvent.keyDown(unconInput(field), { key: "ArrowDown" });
  const option = await screen.findByRole("option", { name: optionName });
  fireEvent.click(option);
};

const expectInvalid = (field: string, invalid: boolean) =>
  waitFor(() => expect(unconInput(field), field).toHaveAttribute("aria-invalid", String(invalid)));

// Every selection rerenders the whole modal, which takes a few seconds in jsdom.
describe("LithologyModal uncon validation", { timeout: 30_000 }, () => {
  afterEach(() => {
    cleanup();
  });

  it("clears the previous-required errors once no later component is left", async () => {
    render(
      <EditStateContext.Provider value={{ editingEnabled: true, setEditingEnabled: () => {} }}>
        <LithologyModal
          lithology={lithology}
          lithologicalDescription={undefined}
          updateLithology={vi.fn()}
          updateLithologicalDescription={vi.fn()}
        />
      </EditStateContext.Provider>,
    );

    await selectOption("lithologyUnconMainId", "reset");
    await selectOption("lithologyUncon2Id", "reset");
    await expectInvalid("lithologyUnconMainId", true);
    await expectInvalid("lithologyUncon2Id", true);

    await selectOption("lithologyUncon3Id", "reset");
    await expectInvalid("lithologyUnconMainId", false);
    await expectInvalid("lithologyUncon2Id", false);

    await selectOption("lithologyUnconMainId", "large block");
    await selectOption("lithologyUncon2Id", "with blocks");
    await expectInvalid("lithologyUnconMainId", false);
    await expectInvalid("lithologyUncon2Id", false);
  });

  it("keeps the error on an earlier component while a later one is still set", async () => {
    render(
      <EditStateContext.Provider value={{ editingEnabled: true, setEditingEnabled: () => {} }}>
        <LithologyModal
          lithology={lithology}
          lithologicalDescription={undefined}
          updateLithology={vi.fn()}
          updateLithologicalDescription={vi.fn()}
        />
      </EditStateContext.Provider>,
    );

    await selectOption("lithologyUnconMainId", "reset");
    await selectOption("lithologyUncon2Id", "reset");
    await selectOption("lithologyUnconMainId", "large block");

    await expectInvalid("lithologyUnconMainId", false);
    await expectInvalid("lithologyUncon2Id", true);
  });
});
