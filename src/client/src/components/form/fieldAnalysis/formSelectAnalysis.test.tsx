// @vitest-environment jsdom
import { FC, PropsWithChildren } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { EditStateContext } from "../../../pages/detail/editStateContext.tsx";
import { FormSelect } from "../formSelect.tsx";
import { FieldChange } from "./fieldAnalysis.ts";
import { FieldAnalysisProvider } from "./fieldAnalysisContext.tsx";

vi.mock("../../codelist.ts", () => ({
  useCodelistDisplayValues: () => (id: number) => ({ text: `code-${id}`, code: "" }),
}));

const change: FieldChange = {
  path: "colorPrimaryId",
  labelKey: "colorPrimary",
  previous: null,
  next: 300,
};

// The repository does not configure data-cy as the testing library's test id attribute, so the
// fields are queried the way the other component tests query them.
const byDataCy = (value: string) => document.querySelector(`[data-cy="${value}"]`);

const Host: FC<PropsWithChildren<{ withAnalysis: boolean; onResetField?: (path: string) => void }>> = ({
  withAnalysis,
  onResetField = () => {},
}) => {
  const formMethods = useForm({ defaultValues: { colorPrimaryId: 300 } });
  const field = (
    <FormSelect fieldName="colorPrimaryId" label="colorPrimary" values={[{ key: 300, name: "light grey" }]} />
  );

  return (
    <EditStateContext.Provider value={{ editingEnabled: true, setEditingEnabled: () => {} }}>
      <FormProvider {...formMethods}>
        {withAnalysis ? (
          <FieldAnalysisProvider changeByPath={new Map([[change.path, change]])} onResetField={onResetField}>
            {field}
          </FieldAnalysisProvider>
        ) : (
          field
        )}
      </FormProvider>
    </EditStateContext.Provider>
  );
};

afterEach(() => {
  cleanup();
});

describe("FormSelect with a field analysis", () => {
  it("renders no highlight and no reset without a provider", () => {
    render(<Host withAnalysis={false} />);

    expect(byDataCy("colorPrimaryId-formSelect")).not.toHaveClass("analysis-highlight");
    expect(byDataCy("colorPrimaryId-analysis-reset")).toBeNull();
  });

  it("highlights the field and offers the reset when the analysis wrote it", () => {
    const onResetField = vi.fn();
    render(<Host withAnalysis onResetField={onResetField} />);

    expect(byDataCy("colorPrimaryId-formSelect")).toHaveClass("analysis-highlight");
    fireEvent.click(byDataCy("colorPrimaryId-analysis-reset")!);

    expect(onResetField).toHaveBeenCalledWith("colorPrimaryId");
  });
});
