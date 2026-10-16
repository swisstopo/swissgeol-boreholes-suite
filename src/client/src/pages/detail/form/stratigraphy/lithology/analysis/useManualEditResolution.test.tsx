// @vitest-environment jsdom
import { ReactNode, useState } from "react";
import { Path, useForm, UseFormReturn } from "react-hook-form";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClassifyResponse, ClassifyVariables } from "../../../../../../api/dataextractionInterfaces.ts";
import { Codelist } from "../../../../../../api/generated";
import { PromptContext } from "../../../../../../components/prompt/promptContext.tsx";
import { ShowPrompt } from "../../../../../../components/prompt/promptInterface.ts";
import { LithologyFormValues } from "../../stratigraphy.ts";
import { useLithologyAnalysis } from "./useLithologyAnalysis.ts";
import { useManualEditResolution } from "./useManualEditResolution.ts";

// Like the real hook, the mock hands out the same t on every render.
vi.mock("react-i18next", () => {
  const t = (key: string) => key;
  return {
    useTranslation: () => ({ t, i18n: { language: "en" } }),
    Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
  };
});

const codelists: Codelist[] = [
  { id: 102, schema: "lithology_uncon_main", code: "Si", en: "silt" },
  { id: 301, schema: "color", code: "", en: "grey" },
  { id: 700, schema: "lithology_con", code: "", en: "sandstone" },
];

const classify = vi.fn<(variables: ClassifyVariables) => Promise<ClassifyResponse>>();

vi.mock("../../../../../../components/codelist.ts", () => ({
  useCodelists: () => ({ data: codelists }),
}));

vi.mock("../../../../../../api/dataextraction.ts", () => ({
  useClassifyLithologicalDescription: () => ({ mutateAsync: classify, isPending: false }),
}));

const showPrompt = vi.fn<ShowPrompt>();

const withPrompt = ({ children }: { children: ReactNode }) => (
  <PromptContext.Provider
    value={{ showPrompt, closePrompt: vi.fn(), promptIsOpen: false, message: "", actions: [], dialogContent: null }}>
    {children}
  </PromptContext.Provider>
);

const initialValues: LithologyFormValues = {
  id: 7,
  stratigraphyId: 1,
  fromDepth: 0,
  toDepth: 0.4,
  isUnconsolidated: true,
  hasBedding: false,
  lithologyDescriptions: [{ id: 0, lithologyId: 7, isFirst: true, lithologyUnconMainId: 103 }],
  lithologicalDescription: { description: "Sand" },
};

const setup = () =>
  renderHook(
    () => {
      const formMethods = useForm<LithologyFormValues>({ defaultValues: initialValues });
      const analysis = useLithologyAnalysis(formMethods);
      useManualEditResolution(formMethods, analysis);
      return { formMethods, analysis };
    },
    { wrapper: withPrompt },
  );

// What a form field emits when the user picks a value. Unlike setValue, the event carries a type.
const editByHand = (
  formMethods: UseFormReturn<LithologyFormValues>,
  name: Path<LithologyFormValues>,
  value: number,
) => {
  act(() => {
    void formMethods.register(name).onChange({ target: { name, value }, type: "change" });
  });
};

const lithologyConPath = "lithologyDescriptions.0.lithologyConId";

const runConsolidatedAnalysis = async (current: ReturnType<typeof setup>["result"]["current"]) => {
  classify.mockResolvedValue({ consolidation: "consolidated", lithology: "sandstone", color: "grey" });
  await act(async () => {
    await current.analysis.run("Sandstein, grau");
  });
};

beforeEach(() => {
  classify.mockReset();
  showPrompt.mockReset();
});

describe("useManualEditResolution", () => {
  it("keeps its subscription while the analysis state stays the same", () => {
    const { result, rerender } = renderHook(
      () => {
        const formMethods = useForm<LithologyFormValues>({ defaultValues: initialValues });
        const [subscribe] = useState(() => vi.fn(formMethods.subscribe));
        useManualEditResolution({ ...formMethods, subscribe }, useLithologyAnalysis(formMethods));
        return subscribe;
      },
      { wrapper: withPrompt },
    );

    rerender();

    expect(result.current).toHaveBeenCalledOnce();
  });

  it("resolves the row of a field the user edits by hand", async () => {
    classify.mockResolvedValue({ consolidation: "unconsolidated", en_main: "si" });
    const { result } = setup();
    await act(async () => {
      await result.current.analysis.run("Silt");
    });

    editByHand(result.current.formMethods, "lithologyDescriptions.0.lithologyUnconMainId", 104);

    expect(showPrompt).not.toHaveBeenCalled();
    expect(result.current.analysis.changeByPath.size).toBe(0);
    expect(result.current.formMethods.getValues().lithologyDescriptions?.[0].lithologyUnconMainId).toBe(104);
  });

  it("asks before a hand edit makes the mode change final", async () => {
    const { result } = setup();
    await runConsolidatedAnalysis(result.current);

    editByHand(result.current.formMethods, lithologyConPath, 701);

    expect(showPrompt).toHaveBeenCalledOnce();
    expect(result.current.analysis.changeByPath.has(lithologyConPath)).toBe(true);
    const [, actions] = showPrompt.mock.calls[0];
    expect(actions.map(action => action.label)).toEqual(["cancel", "acceptChange"]);

    act(() => actions[1].action?.());

    expect(result.current.analysis.isModeChangeFixed).toBe(true);
    expect(result.current.analysis.changeByPath.has(lithologyConPath)).toBe(false);
    expect(result.current.formMethods.getValues().lithologyDescriptions?.[0].lithologyConId).toBe(701);
  });

  it("puts the analysis's value back when the user declines", async () => {
    const { result } = setup();
    await runConsolidatedAnalysis(result.current);

    editByHand(result.current.formMethods, lithologyConPath, 701);
    const [, actions] = showPrompt.mock.calls[0];
    act(() => actions[0].action?.());

    expect(result.current.analysis.isModeChangeFixed).toBe(false);
    expect(result.current.analysis.changeByPath.has(lithologyConPath)).toBe(true);
    expect(result.current.formMethods.getValues().lithologyDescriptions?.[0].lithologyConId).toBe(700);
  });
});
