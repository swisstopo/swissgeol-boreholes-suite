// @vitest-environment jsdom
import { useForm } from "react-hook-form";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Codelist } from "../../../../../../api/generated";
import { LithologyFormValues } from "../../stratigraphy.ts";
import { useLithologyAnalysis } from "./useLithologyAnalysis.ts";

const codelist = (schema: string, code: string, en: string, id: number): Codelist => ({ id, schema, code, en });

const codelists: Codelist[] = [
  codelist("lithology_uncon_main", "Si", "silt", 102),
  codelist("lithology_uncon_main", "Sa", "sand", 103),
  codelist("component_uncon_organic", "", "humus", 401),
  codelist("component_uncon_organic", "", "earth", 402),
  codelist("component_uncon_organic", "", "roots", 403),
  codelist("color", "", "grey", 301),
  codelist("lithology_con", "", "sandstone", 700),
];

const classify = vi.fn();

vi.mock("../../../../../../components/codelist.ts", () => ({
  useCodelists: () => ({ data: codelists }),
  useCodelistDisplayValues: () => (id: number) => ({ text: `code-${id}`, code: "" }),
}));

vi.mock("../../../../../../api/dataextraction.ts", () => ({
  useClassifyLithologicalDescription: () => ({ mutateAsync: classify, isPending: false }),
}));

// The state of the issue's example: Lockergestein, Hauptbestandteil Sand, Organische Bestandteile
// Humus and Wurzeln, Primaerfarbe grau.
const initialValues: LithologyFormValues = {
  id: 7,
  stratigraphyId: 1,
  fromDepth: 0,
  toDepth: 0.4,
  isUnconsolidated: true,
  hasBedding: false,
  lithologyDescriptions: [
    {
      id: 0,
      lithologyId: 7,
      isFirst: true,
      lithologyUnconMainId: 103,
      componentUnconOrganicCodelistIds: [401, 403],
      colorPrimaryId: 301,
    },
  ],
  lithologicalDescription: { description: "Sand, humos" },
};

const setup = () =>
  renderHook(() => {
    const formMethods = useForm<LithologyFormValues>({ defaultValues: initialValues });
    return { formMethods, analysis: useLithologyAnalysis(formMethods) };
  });

beforeEach(() => {
  classify.mockReset();
});

describe("useLithologyAnalysis", () => {
  it("writes the classified values and lists one row per changed field", async () => {
    classify.mockResolvedValue({
      consolidation: "unconsolidated",
      en_main: "si",
      organic_components: ["humus", "earth"],
    });
    const { result } = setup();

    await act(async () => {
      await result.current.analysis.run("Silt, humos");
    });

    const values = result.current.formMethods.getValues();
    expect(values.lithologyDescriptions?.[0].lithologyUnconMainId).toBe(102);
    expect(values.lithologyDescriptions?.[0].componentUnconOrganicCodelistIds).toEqual([401, 402]);
    // The colour was not classified, so it keeps its value and gets no row.
    expect(values.lithologyDescriptions?.[0].colorPrimaryId).toBe(301);
    expect([...result.current.analysis.changeByPath.keys()]).toEqual([
      "lithologyDescriptions.0.lithologyUnconMainId",
      "lithologyDescriptions.0.componentUnconOrganicCodelistIds",
    ]);
  });

  it("restores the value the field had before the analysis when a row is reset", async () => {
    classify.mockResolvedValue({ consolidation: "unconsolidated", en_main: "si" });
    const { result } = setup();

    await act(async () => {
      await result.current.analysis.run("Silt");
    });
    act(() => {
      result.current.analysis.resetField("lithologyDescriptions.0.lithologyUnconMainId");
    });

    expect(result.current.formMethods.getValues().lithologyDescriptions?.[0].lithologyUnconMainId).toBe(103);
    expect(result.current.analysis.changeByPath.size).toBe(0);
    expect(result.current.analysis.hasPendingChanges).toBe(false);
  });

  it("treats an unsaved manual edit as the value a reset restores", async () => {
    classify.mockResolvedValue({ consolidation: "unconsolidated", en_main: "si" });
    const { result } = setup();

    act(() => {
      result.current.formMethods.setValue("lithologyDescriptions.0.lithologyUnconMainId", 102);
      result.current.formMethods.setValue("lithologyDescriptions.0.colorPrimaryId", null);
    });
    await act(async () => {
      await result.current.analysis.run("Sand");
    });

    // The manual edit already matches the classification, so there is nothing to report.
    expect(result.current.analysis.changeByPath.size).toBe(0);
  });

  it("keeps the new value and drops the row when a row is accepted", async () => {
    classify.mockResolvedValue({ consolidation: "unconsolidated", en_main: "si" });
    const { result } = setup();

    await act(async () => {
      await result.current.analysis.run("Silt");
    });
    act(() => {
      result.current.analysis.acceptField("lithologyDescriptions.0.lithologyUnconMainId");
    });

    expect(result.current.formMethods.getValues().lithologyDescriptions?.[0].lithologyUnconMainId).toBe(102);
    expect(result.current.analysis.changeByPath.size).toBe(0);
  });

  it("switches the mode, clears the previous mode and stays revertible", async () => {
    classify.mockResolvedValue({ consolidation: "consolidated", lithology: "sandstone" });
    const { result } = setup();

    await act(async () => {
      await result.current.analysis.run("Sandstein");
    });

    expect(result.current.formMethods.getValues().isUnconsolidated).toBe(false);
    expect(result.current.analysis.modeChange).toEqual({ previous: true, next: false });
    expect(result.current.analysis.hasPendingChanges).toBe(true);
  });

  it("keeps the analysis alive for the mode change after every row is accepted", async () => {
    classify.mockResolvedValue({ consolidation: "consolidated", lithology: "sandstone" });
    const { result } = setup();

    await act(async () => {
      await result.current.analysis.run("Sandstein");
    });
    act(() => {
      result.current.analysis.acceptField("lithologyDescriptions.0.lithologyConId");
    });

    expect(result.current.analysis.changeByPath.size).toBe(0);
    expect(result.current.analysis.modeChange).toBeDefined();
    expect(result.current.analysis.hasPendingChanges).toBe(true);
  });

  it("restores every value of the previous mode on resetAll", async () => {
    classify.mockResolvedValue({ consolidation: "consolidated", lithology: "sandstone" });
    const { result } = setup();

    await act(async () => {
      await result.current.analysis.run("Sandstein");
    });
    act(() => {
      result.current.analysis.resetAll();
    });

    const values = result.current.formMethods.getValues();
    expect(values.isUnconsolidated).toBe(true);
    expect(values.lithologyDescriptions?.[0].lithologyUnconMainId).toBe(103);
    expect(values.lithologyDescriptions?.[0].componentUnconOrganicCodelistIds).toEqual([401, 403]);
    expect(values.lithologyDescriptions?.[0].colorPrimaryId).toBe(301);
    expect(result.current.analysis.hasPendingChanges).toBe(false);
  });

  it("leaves a later manual edit alone on resetAll without a mode change", async () => {
    classify.mockResolvedValue({ consolidation: "unconsolidated", en_main: "si" });
    const { result } = setup();

    await act(async () => {
      await result.current.analysis.run("Silt");
    });
    act(() => {
      result.current.formMethods.setValue("notes", "typed after the analysis");
      result.current.analysis.resetAll();
    });

    expect(result.current.formMethods.getValues().notes).toBe("typed after the analysis");
    expect(result.current.formMethods.getValues().lithologyDescriptions?.[0].lithologyUnconMainId).toBe(103);
  });

  it("clears everything pending on acceptAll", async () => {
    classify.mockResolvedValue({ consolidation: "consolidated", lithology: "sandstone" });
    const { result } = setup();

    await act(async () => {
      await result.current.analysis.run("Sandstein");
    });
    act(() => {
      result.current.analysis.acceptAll();
    });

    expect(result.current.analysis.hasPendingChanges).toBe(false);
    expect(result.current.analysis.modeChange).toBeUndefined();
    expect(result.current.formMethods.getValues().isUnconsolidated).toBe(false);
  });

  it("takes a fresh baseline when run again", async () => {
    classify.mockResolvedValueOnce({ consolidation: "unconsolidated", en_main: "si" });
    const { result } = setup();

    await act(async () => {
      await result.current.analysis.run("Silt");
    });
    classify.mockResolvedValueOnce({ consolidation: "unconsolidated", en_main: "sa" });
    await act(async () => {
      await result.current.analysis.run("Sand");
    });
    act(() => {
      result.current.analysis.resetField("lithologyDescriptions.0.lithologyUnconMainId");
    });

    // The second run's baseline is the silt the first run wrote, not the original sand.
    expect(result.current.formMethods.getValues().lithologyDescriptions?.[0].lithologyUnconMainId).toBe(102);
  });

  it("drops the analysis on discard without touching the values", async () => {
    classify.mockResolvedValue({ consolidation: "unconsolidated", en_main: "si" });
    const { result } = setup();

    await act(async () => {
      await result.current.analysis.run("Silt");
    });
    act(() => {
      result.current.analysis.discard();
    });

    expect(result.current.analysis.hasPendingChanges).toBe(false);
    expect(result.current.formMethods.getValues().lithologyDescriptions?.[0].lithologyUnconMainId).toBe(102);
  });

  it("reports how many items wait for the user, counting the mode change as one", async () => {
    classify.mockResolvedValue({ consolidation: "consolidated", lithology: "sandstone" });
    const { result } = setup();

    let pending = -1;
    await act(async () => {
      pending = await result.current.analysis.run("Sandstein");
    });

    expect(pending).toBe(2);
  });

  it("reports nothing pending when the description yields no value", async () => {
    classify.mockResolvedValue({});
    const { result } = setup();

    let pending = -1;
    await act(async () => {
      pending = await result.current.analysis.run("keine Angabe");
    });

    // The layer leaves the unconsolidated mode for the unspecified one, which is the single item.
    expect(pending).toBe(1);
  });
});
