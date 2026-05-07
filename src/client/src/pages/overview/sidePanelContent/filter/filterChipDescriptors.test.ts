import { beforeEach, describe, expect, it, vi } from "vitest";
import { filterParsers } from "../../useBoreholeUrlParams";
import { buildFilterChipDescriptors, FilterFieldMetaData, type ChipDescriptorInputs } from "./filterChipDescriptors";

const mockTranslationFunction = ((key: string) => {
  const dict: Record<string, string> = {
    boreholeStatus: "Borehole status",
    workgroup: "Workgroup",
    original_name: "Original name",
    project_name: "Project name",
    name: "Name",
    workflowStatus: "Workflow status",
    "statuses.published": "published",
    totaldepth: "Total depth",
    restriction_until: "Restriction until",
    top_bedrock_fresh_md: "Top bedrock fresh",
    top_bedrock_weathered_md: "Top bedrock weathered",
    nationalInterest: "National interest",
    topBedrockIntersected: "Top bedrock intersected",
    hasGroundwater: "Has groundwater",
    hasGeometry: "Has geometry",
    hasLogs: "Has logs",
    hasProfiles: "Has profiles",
    hasPhotos: "Has photos",
    hasDocuments: "Has documents",
    yes: "Yes",
    no: "No",
    np: "Keine Angabe",
  };
  return dict[key] ?? key;
}) as unknown as ChipDescriptorInputs["t"];

const mockCodelists = [
  { id: 10, schema: "borehole_status", order: 1, code: "open", de: "offen", en: "open", fr: "ouvert", it: "aperto" },
  {
    id: 11,
    schema: "borehole_status",
    order: 2,
    code: "filled",
    de: "gefüllt",
    en: "filled",
    fr: "rempli",
    it: "riempito",
  },
] as unknown as ChipDescriptorInputs["codelists"];

const getCodelistLabel = ((c: { en: string }) => c.en) as unknown as ChipDescriptorInputs["getCodelistLabel"];

const mockWorkgroups = [
  { id: 1, name: "swisstopo", boreholeCount: 0 },
  { id: 2, name: "geowerkstatt", boreholeCount: 0 },
] as unknown as ChipDescriptorInputs["workgroups"];

const baseInputs: ChipDescriptorInputs = {
  filterParams: {},
  codelists: [],
  getCodelistLabel: () => "",
  workgroups: [],
  t: mockTranslationFunction,
  setField: vi.fn(),
  clearField: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("buildFilterChipDescriptors", () => {
  it("returns [] when no filter params are set", () => {
    expect(buildFilterChipDescriptors(baseInputs)).toEqual([]);
  });
});

describe("multiselect (codelist) chips", () => {
  it("renders one chip per selected value with category tooltip", () => {
    const descriptors = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { statusId: [10, 11] },
      codelists: mockCodelists,
      getCodelistLabel,
    });
    expect(descriptors).toHaveLength(2);
    expect(descriptors[0]).toMatchObject({
      id: "statusId:10",
      label: "open",
      tooltip: "Borehole status: open",
      testId: "filter-chip-statusId-10",
    });
    expect(descriptors[1].label).toBe("filled");
  });

  it("deleting one chip removes only that value", () => {
    const [first] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { statusId: [10, 11] },
      codelists: mockCodelists,
      getCodelistLabel,
    });
    first.onDelete();
    expect(baseInputs.setField).toHaveBeenCalledWith("statusId", [11]);
  });

  it("deleting the last value clears the field", () => {
    const [only] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { statusId: [10] },
      codelists: mockCodelists,
      getCodelistLabel,
    });
    only.onDelete();
    expect(baseInputs.clearField).toHaveBeenCalledWith("statusId");
    expect(baseInputs.setField).not.toHaveBeenCalled();
  });

  it("falls back to #<id> when codelist entry missing (stale URL)", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { statusId: [999] },
      codelists: mockCodelists,
      getCodelistLabel,
    });
    expect(desc.label).toBe("#999");
  });

  it("skips codelist-backed chips while codelists are still loading (empty array)", () => {
    const descriptors = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { statusId: [10, 11] },
      codelists: [], // loading state — nothing resolved yet
      getCodelistLabel,
    });
    expect(descriptors).toEqual([]);
  });
});

describe("multiselect (workgroup) chips", () => {
  it("renders one chip per workgroup with the workgroup name", () => {
    const descriptors = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { workgroupId: [1, 2] },
      workgroups: mockWorkgroups,
    });
    expect(descriptors).toHaveLength(2);
    expect(descriptors[0]).toMatchObject({
      id: "workgroupId:1",
      label: "swisstopo",
      tooltip: "Workgroup: swisstopo",
      testId: "filter-chip-workgroupId-1",
    });
    expect(descriptors[1].label).toBe("geowerkstatt");
  });

  it("delete removes only that workgroup id", () => {
    const [first] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { workgroupId: [1, 2] },
      workgroups: mockWorkgroups,
    });
    first.onDelete();
    expect(baseInputs.setField).toHaveBeenCalledWith("workgroupId", [2]);
  });

  it("deleting the last workgroup value clears the field", () => {
    const [only] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { workgroupId: [1] },
      workgroups: mockWorkgroups,
    });
    only.onDelete();
    expect(baseInputs.clearField).toHaveBeenCalledWith("workgroupId");
    expect(baseInputs.setField).not.toHaveBeenCalled();
  });

  it("unknown workgroup id falls back to #<id>", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { workgroupId: [99] },
      workgroups: mockWorkgroups,
    });
    expect(desc.label).toBe("#99");
    expect(desc.tooltip).toBe("Workgroup: #99");
  });

  it("skips workgroup chips while workgroups are still loading (empty array)", () => {
    const descriptors = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { workgroupId: [1, 2] },
      workgroups: [], // loading state — nothing resolved yet
    });
    expect(descriptors).toEqual([]);
  });
});

describe("text chips", () => {
  it("renders a free-text chip with value label and category tooltip", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { originalName: "ABC-123" },
    });
    expect(desc).toMatchObject({
      id: "originalName",
      label: "ABC-123",
      tooltip: "Original name: ABC-123",
      testId: "filter-chip-originalName",
    });
  });

  it("projectName renders with its own category label", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { projectName: "Foo" },
    });
    expect(desc.label).toBe("Foo");
    expect(desc.tooltip).toBe("Project name: Foo");
  });

  it("name renders with its own category label", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { name: "Bar" },
    });
    expect(desc.label).toBe("Bar");
    expect(desc.tooltip).toBe("Name: Bar");
  });

  it("workflowStatus renders one chip per selected status, translated through translateValue", () => {
    const descs = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { workflowStatus: ["published"] },
    });
    expect(descs).toHaveLength(1);
    const [desc] = descs;
    expect(desc.label).toBe("Published");
    expect(desc.tooltip).toBe("Workflow status: Published");
    expect(desc.id).toBe("workflowStatus:published");
    expect(desc.testId).toBe("filter-chip-workflowStatus-published");
  });

  it("workflowStatus delete with remaining values calls setField with the rest", () => {
    const [first] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { workflowStatus: ["published", "draft"] },
    });
    first.onDelete();
    expect(baseInputs.setField).toHaveBeenCalledWith("workflowStatus", ["draft"]);
  });

  it("workflowStatus delete of last value clears the field", () => {
    const [only] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { workflowStatus: ["published"] },
    });
    only.onDelete();
    expect(baseInputs.clearField).toHaveBeenCalledWith("workflowStatus");
    expect(baseInputs.setField).not.toHaveBeenCalled();
  });

  it("delete clears the field", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { originalName: "ABC" },
    });
    desc.onDelete();
    expect(baseInputs.clearField).toHaveBeenCalledWith("originalName");
    expect(baseInputs.setField).not.toHaveBeenCalled();
  });

  it("empty string renders no chip", () => {
    const descriptors = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { originalName: "" },
    });
    expect(descriptors).toEqual([]);
  });

  it("whitespace-only string renders no chip", () => {
    const descriptors = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { projectName: "   " },
    });
    expect(descriptors).toEqual([]);
  });
});

describe("range chips", () => {
  it("renders a > chip for rangeMin (numeric)", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { totalDepthMin: 100 },
    });
    expect(desc).toMatchObject({
      id: "totalDepthMin",
      label: "> 100",
      tooltip: "Total depth min: > 100",
      testId: "filter-chip-totalDepthMin",
    });
  });

  it("renders a < chip for rangeMax (numeric)", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { totalDepthMax: 200 },
    });
    expect(desc).toMatchObject({
      id: "totalDepthMax",
      label: "< 200",
      tooltip: "Total depth max: < 200",
      testId: "filter-chip-totalDepthMax",
    });
  });

  it("renders both min and max chips when both bounds are set", () => {
    const descs = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { totalDepthMin: 100, totalDepthMax: 200 },
    });
    expect(descs).toHaveLength(2);
    expect(descs.map(d => d.label)).toEqual(["> 100", "< 200"]);
    expect(descs.map(d => d.id)).toEqual(["totalDepthMin", "totalDepthMax"]);
  });

  it("renders rangeMin for other numeric range keys", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { topBedrockFreshMdMin: 42 },
    });
    expect(desc.label).toBe("> 42");
    expect(desc.tooltip).toBe("Top bedrock fresh min: > 42");
  });

  it("renders rangeMax for topBedrockWeatheredMdMax", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { topBedrockWeatheredMdMax: 75 },
    });
    expect(desc.label).toBe("< 75");
    expect(desc.tooltip).toBe("Top bedrock weathered max: < 75");
  });

  it("date range min uses the same > prefix", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { restrictionUntilFrom: "2024-01-01" },
    });
    expect(desc).toMatchObject({
      id: "restrictionUntilFrom",
      label: "> 2024-01-01",
      tooltip: "Restriction until from: > 2024-01-01",
      testId: "filter-chip-restrictionUntilFrom",
    });
  });

  it("date range max uses the < prefix", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { restrictionUntilTo: "2024-12-31" },
    });
    expect(desc.label).toBe("< 2024-12-31");
    expect(desc.tooltip).toBe("Restriction until to: < 2024-12-31");
  });

  it("delete clears only that bound", () => {
    const descs = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { totalDepthMin: 100, totalDepthMax: 200 },
    });
    descs[0].onDelete();
    expect(baseInputs.clearField).toHaveBeenCalledWith("totalDepthMin");
    expect(baseInputs.setField).not.toHaveBeenCalled();
  });

  it("delete on max bound clears only the max", () => {
    const descs = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { totalDepthMin: 100, totalDepthMax: 200 },
    });
    descs[1].onDelete();
    expect(baseInputs.clearField).toHaveBeenCalledWith("totalDepthMax");
  });

  it("null range value renders no chip", () => {
    const descriptors = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { totalDepthMin: null as unknown as number },
    });
    expect(descriptors).toEqual([]);
  });

  it("undefined range value renders no chip", () => {
    const descriptors = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: {},
    });
    expect(descriptors).toEqual([]);
  });

  it("empty-string date range value renders no chip", () => {
    const descriptors = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { restrictionUntilFrom: "" },
    });
    expect(descriptors).toEqual([]);
  });
});

describe("nullable boolean chips (allowNull: true)", () => {
  it("renders Yes chip with prefixed label and no tooltip", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { hasGroundwater: "true" },
    });
    expect(desc).toMatchObject({
      id: "hasGroundwater",
      label: "Has groundwater: Yes",
      testId: "filter-chip-hasGroundwater",
    });
    expect(desc.tooltip).toBeUndefined();
  });

  it("renders No chip", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { hasGroundwater: "false" },
    });
    expect(desc.label).toBe("Has groundwater: No");
    expect(desc.tooltip).toBeUndefined();
  });

  it("renders Keine Angabe chip when allowNull and value is 'null'", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { hasGroundwater: "null" },
    });
    expect(desc.label).toBe("Has groundwater: Keine Angabe");
  });

  it("renders nationalInterest Yes chip", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { nationalInterest: "true" },
    });
    expect(desc.label).toBe("National interest: Yes");
    expect(desc.id).toBe("nationalInterest");
  });

  it("renders topBedrockIntersected Keine Angabe chip", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { topBedrockIntersected: "null" },
    });
    expect(desc.label).toBe("Top bedrock intersected: Keine Angabe");
  });

  it("delete calls clearField (not setField)", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { hasGroundwater: "null" },
    });
    desc.onDelete();
    expect(baseInputs.clearField).toHaveBeenCalledWith("hasGroundwater");
    expect(baseInputs.setField).not.toHaveBeenCalled();
  });

  it("undefined value produces no chip", () => {
    const descriptors = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: {},
    });
    expect(descriptors).toEqual([]);
  });
});

describe("nullable boolean chips (allowNull: false)", () => {
  it("renders Yes chip for hasGeometry", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { hasGeometry: "true" },
    });
    expect(desc).toMatchObject({
      id: "hasGeometry",
      label: "Has geometry: Yes",
      testId: "filter-chip-hasGeometry",
    });
    expect(desc.tooltip).toBeUndefined();
  });

  it("renders No chip for hasLogs", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { hasLogs: "false" },
    });
    expect(desc.label).toBe("Has logs: No");
  });

  it("does NOT render Keine Angabe for allowNull:false fields even if URL has 'null'", () => {
    const descriptors = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { hasLogs: "null" },
    });
    expect(descriptors).toHaveLength(0);
  });

  it("renders Yes chip for hasProfiles / hasPhotos / hasDocuments", () => {
    const descs = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { hasProfiles: "true", hasPhotos: "true", hasDocuments: "true" },
    });
    expect(descs.map(d => d.label)).toEqual(["Has profiles: Yes", "Has photos: Yes", "Has documents: Yes"]);
  });

  it("delete calls clearField for allowNull:false field", () => {
    const [desc] = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { hasGeometry: "true" },
    });
    desc.onDelete();
    expect(baseInputs.clearField).toHaveBeenCalledWith("hasGeometry");
    expect(baseInputs.setField).not.toHaveBeenCalled();
  });
});

describe("string-multiselect chips for canton and municipality", () => {
  it("renders one chip per selected canton with category tooltip", () => {
    const descriptors = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { canton: ["Bern", "Vaud"] },
      t: ((key: string) => (key === "canton" ? "Canton" : key)) as unknown as ChipDescriptorInputs["t"],
    });
    expect(descriptors).toHaveLength(2);
    expect(descriptors[0].label).toBe("Bern");
    expect(descriptors[0].tooltip).toBe("Canton: Bern");
    expect(descriptors[1].label).toBe("Vaud");
  });

  it("renders one chip per selected municipality", () => {
    const descriptors = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { municipality: ["Lausanne"] },
      t: ((key: string) => (key === "municipality" ? "Municipality" : key)) as unknown as ChipDescriptorInputs["t"],
    });
    expect(descriptors).toHaveLength(1);
    expect(descriptors[0].label).toBe("Lausanne");
  });

  it("clears the field when the last canton chip is deleted", () => {
    const clearField = vi.fn();
    const descriptors = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { canton: ["Bern"] },
      clearField,
    });
    descriptors[0].onDelete();
    expect(clearField).toHaveBeenCalledWith("canton");
  });
});

describe("codelist-multiselect chips for log tool type", () => {
  it("renders chips using log_tool_type codelist labels", () => {
    const toolTypeCodelists = [
      { id: 100000201, schema: "log_tool_type", order: 1, code: "gr", de: "GR", en: "Gamma Ray", fr: "GR", it: "GR" },
    ] as unknown as ChipDescriptorInputs["codelists"];
    const descriptors = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: { logToolTypeId: [100000201] },
      codelists: toolTypeCodelists,
      getCodelistLabel,
      t: ((key: string) => (key === "toolType" ? "Tool type" : key)) as unknown as ChipDescriptorInputs["t"],
    });
    expect(descriptors).toHaveLength(1);
    expect(descriptors[0].label).toBe("Gamma Ray");
    expect(descriptors[0].tooltip).toBe("Tool type: Gamma Ray");
  });
});

describe("FILTER_FIELD_META ordering contract", () => {
  it("FILTER_FIELD_META preserves filterParsers declaration order", () => {
    // Guards against three kinds of drift:
    //  1. Adding a new filter parser without adding a meta entry here.
    //  2. Adding a meta entry that doesn't correspond to a parser (or out of order).
    //  3. Renaming/removing a key in one place but not the other.
    // The chip render order is `Object.keys(FILTER_FIELD_META)`; if it diverges
    // from `filterParsers` key order, the URL↔chip contract silently breaks.
    expect(Object.keys(FilterFieldMetaData)).toEqual(Object.keys(filterParsers));
  });

  it("returns descriptors in FILTER_FIELD_META declaration order regardless of filterParams key insertion order", () => {
    // Behavioral complement to the structural test above: even if filterParams
    // is built up with keys in an order opposite to the declaration order,
    // buildFilterChipDescriptors must emit chips in FILTER_KEY_ORDER — because
    // the dispatch loop iterates FILTER_KEY_ORDER, not Object.keys(filterParams).
    const descs = buildFilterChipDescriptors({
      ...baseInputs,
      filterParams: {
        // Insertion order here is totalDepthMin → statusId → originalName,
        // which is the REVERSE of the FILTER_FIELD_META declaration order
        // (originalName comes first, statusId next, totalDepthMin last).
        totalDepthMin: 10,
        statusId: [10],
        originalName: "X",
      },
      codelists: mockCodelists,
      getCodelistLabel,
      t: ((k: string) => k) as ChipDescriptorInputs["t"],
    });
    // originalName < statusId < totalDepthMin per FILTER_FIELD_META ordering.
    expect(descs.map(d => d.id)).toEqual(["originalName", "statusId:10", "totalDepthMin"]);
  });
});
