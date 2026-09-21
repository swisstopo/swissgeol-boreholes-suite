import { describe, expect, it } from "vitest";
import { Codelist } from "../../../../../../api/generated";
import { findCodelistId, normaliseCode, normaliseText } from "./classificationMapping.ts";

const codelist = (schema: string, code: string, en: string, id: number): Codelist => ({ id, schema, code, en });

const codelists: Codelist[] = [
  codelist("lithology_uncon_main", "MGr", "medium gravel", 100),
  codelist("lithology_uncon_main", "Or", "organic soil", 101),
  codelist("uscs_type", "GP-GC", "", 200),
  codelist("color", "", "light grey", 300),
  codelist("component_uncon_debris", "", "fragments, splitters", 400),
  codelist("grain_angularity", "", "sub-rounded", 500),
  codelist("component_con_mineral", "", "K-feldspar", 600),
  codelist("component_con_mineral", "", "biotite", 601),
];

describe("normaliseText", () => {
  it("reduces every run of non alphanumeric characters to a single space", () => {
    expect(normaliseText("remains_of_plants")).toBe("remains of plants");
    expect(normaliseText("fragments, splitters")).toBe("fragments splitters");
    expect(normaliseText("sub-rounded")).toBe("sub rounded");
    expect(normaliseText("K-feldspar")).toBe("k feldspar");
    expect(normaliseText("  light_grey  ")).toBe("light grey");
  });
});

describe("normaliseCode", () => {
  it("lowercases, drops a trailing underscore and joins compounds with a hyphen", () => {
    expect(normaliseCode("mgr")).toBe("mgr");
    expect(normaliseCode("MGr")).toBe("mgr");
    expect(normaliseCode("or_")).toBe("or");
    expect(normaliseCode("GP_GC")).toBe("gp-gc");
    expect(normaliseCode("GP-GC")).toBe("gp-gc");
  });
});

describe("findCodelistId", () => {
  it("matches a code case insensitively", () => {
    expect(findCodelistId(codelists, "lithology_uncon_main", "code", "mgr")).toBe(100);
  });

  it("matches a code whose enum member carries the escaping underscore", () => {
    expect(findCodelistId(codelists, "lithology_uncon_main", "code", "or_")).toBe(101);
  });

  it("matches a compound code that the service joins with an underscore", () => {
    expect(findCodelistId(codelists, "uscs_type", "code", "GP_GC")).toBe(200);
  });

  it("matches an english text across underscores, commas and hyphens", () => {
    expect(findCodelistId(codelists, "color", "text", "light_grey")).toBe(300);
    expect(findCodelistId(codelists, "component_uncon_debris", "text", "fragments_splitters")).toBe(400);
    expect(findCodelistId(codelists, "grain_angularity", "text", "sub_rounded")).toBe(500);
    expect(findCodelistId(codelists, "component_con_mineral", "text", "k_feldspar")).toBe(600);
  });

  it("only considers the requested schema", () => {
    expect(findCodelistId(codelists, "color", "text", "biotite")).toBeUndefined();
  });

  it("returns undefined for an unknown value", () => {
    expect(findCodelistId(codelists, "lithology_uncon_main", "code", "zzz")).toBeUndefined();
  });

  it("never matches an empty code, which many codelists carry", () => {
    expect(findCodelistId(codelists, "color", "code", "")).toBeUndefined();
  });
});

import { LithologyFormValues } from "../../stratigraphy.ts";
import { mapClassificationToChanges } from "./classificationMapping.ts";

const mappingCodelists: Codelist[] = [
  ...codelists,
  codelist("lithology_uncon_main", "Si", "silt", 102),
  codelist("lithology_uncon_secondary", "fsa", "fine sand", 110),
  codelist("lithology_uncon_secondary", "si", "silt", 111),
  codelist("lithology_uncon_secondary", "co", "cobbles", 112),
  codelist("lithology_uncon_secondary", "or", "organic soil", 113),
  codelist("component_uncon_organic", "", "remains of wood", 410),
  codelist("lithology_con", "", "sandstone", 700),
  codelist("cementation", "", "well cemented", 701),
  codelist("alteration_degree", "", "moderately weathered", 702),
  codelist("component_con_particle", "", "biodetritus", 703),
];

const formValues = (overrides: Partial<LithologyFormValues> = {}): LithologyFormValues => ({
  id: 7,
  stratigraphyId: 1,
  fromDepth: 0,
  toDepth: 0.4,
  isUnconsolidated: true,
  hasBedding: false,
  lithologyDescriptions: [{ id: 0, lithologyId: 7, isFirst: true }],
  ...overrides,
});

describe("mapClassificationToChanges", () => {
  it("maps a single code onto its description field", () => {
    const { changes, modeChange } = mapClassificationToChanges(
      { consolidation: "unconsolidated", en_main: "mgr" },
      mappingCodelists,
      formValues(),
    );

    expect(modeChange).toBeUndefined();
    expect(changes).toEqual([
      {
        path: "lithologyDescriptions.0.lithologyUnconMainId",
        labelKey: "lithologyUnconMain",
        previous: null,
        next: 100,
      },
    ]);
  });

  it("fans en_secondary out over the secondary fields in order, leaving no hole", () => {
    const { changes } = mapClassificationToChanges(
      { consolidation: "unconsolidated", en_secondary: ["fsa", "si", "co", "or_"] },
      mappingCodelists,
      formValues(),
    );

    expect(changes.map(change => [change.path, change.next])).toEqual([
      ["lithologyDescriptions.0.lithologyUncon2Id", 110],
      ["lithologyDescriptions.0.lithologyUncon3Id", 111],
      ["lithologyDescriptions.0.lithologyUncon4Id", 112],
      ["lithologyDescriptions.0.lithologyUncon5Id", 113],
    ]);
    expect(changes[0].labelKey).toBe("lithologyUnconSecondary");
    expect(changes[1].labelKey).toBe("componentUncon");
  });

  it("drops en_secondary elements beyond the fifth field", () => {
    const { changes } = mapClassificationToChanges(
      { consolidation: "unconsolidated", en_secondary: ["fsa", "si", "co", "or", "fsa", "si"] },
      mappingCodelists,
      formValues(),
    );

    expect(changes).toHaveLength(5);
  });

  it("wraps the single uscs value in a list", () => {
    const { changes } = mapClassificationToChanges(
      { consolidation: "unconsolidated", uscs: "GP_GC" },
      mappingCodelists,
      formValues(),
    );

    expect(changes).toEqual([{ path: "uscsTypeCodelistIds", labelKey: "uscsType", previous: null, next: [200] }]);
  });

  it("accepts uscs as a list as well", () => {
    const { changes } = mapClassificationToChanges(
      { consolidation: "unconsolidated", uscs: ["GP_GC"] },
      mappingCodelists,
      formValues(),
    );

    expect(changes[0].next).toEqual([200]);
  });

  it("reports no change when the value already matches the current one", () => {
    const current = formValues({
      lithologyDescriptions: [{ id: 0, lithologyId: 7, isFirst: true, lithologyUnconMainId: 100 }],
    });

    const { changes } = mapClassificationToChanges(
      { consolidation: "unconsolidated", en_main: "mgr" },
      mappingCodelists,
      current,
    );

    expect(changes).toEqual([]);
  });

  it("reports the current value as previous when the mode does not change", () => {
    const current = formValues({
      lithologyDescriptions: [{ id: 0, lithologyId: 7, isFirst: true, lithologyUnconMainId: 102 }],
    });

    const { changes } = mapClassificationToChanges(
      { consolidation: "unconsolidated", en_main: "mgr" },
      mappingCodelists,
      current,
    );

    expect(changes[0].previous).toBe(102);
  });

  it("reports an empty previous value for every field when the mode changes", () => {
    const current = formValues({
      lithologyDescriptions: [{ id: 0, lithologyId: 7, isFirst: true, colorPrimaryId: 300 }],
      alterationDegreeId: 702,
    });

    const { changes, modeChange } = mapClassificationToChanges(
      { consolidation: "consolidated", lithology: "sandstone", color: "light_grey" },
      mappingCodelists,
      current,
    );

    expect(modeChange).toEqual({ previous: true, next: false });
    expect(changes.every(change => change.previous === null)).toBe(true);
  });

  it("switches to the unspecified mode when consolidation is absent", () => {
    const { changes, modeChange } = mapClassificationToChanges({}, mappingCodelists, formValues());

    expect(modeChange).toEqual({ previous: true, next: null });
    expect(changes).toEqual([]);
  });

  it("reports nothing at all when the layer is already unspecified", () => {
    const { changes, modeChange } = mapClassificationToChanges(
      {},
      mappingCodelists,
      formValues({ isUnconsolidated: null, lithologyDescriptions: [] }),
    );

    expect(modeChange).toBeUndefined();
    expect(changes).toEqual([]);
  });

  it("ignores keys that do not belong to the returned mode", () => {
    const { changes } = mapClassificationToChanges(
      { consolidation: "consolidated", en_main: "mgr", lithology: "sandstone" },
      mappingCodelists,
      formValues({ isUnconsolidated: false }),
    );

    expect(changes.map(change => change.path)).toEqual(["lithologyDescriptions.0.lithologyConId"]);
  });

  it("ignores an unmatched value and an unknown key", () => {
    const { changes } = mapClassificationToChanges(
      { consolidation: "unconsolidated", en_main: "not-a-code", nonsense: "x" } as never,
      mappingCodelists,
      formValues(),
    );

    expect(changes).toEqual([]);
  });

  it("maps every consolidated attribute", () => {
    const { changes } = mapClassificationToChanges(
      {
        consolidation: "consolidated",
        lithology: "sandstone",
        color: "light_grey",
        cementation: "well_cemented",
        alteration_degree_consolidated: "moderately_weathered",
        mineral_components: ["biotite"],
        accessory_components: ["biodetritus"],
      },
      mappingCodelists,
      formValues({ isUnconsolidated: false }),
    );

    expect(changes.map(change => [change.path, change.next])).toEqual([
      ["lithologyDescriptions.0.lithologyConId", 700],
      ["lithologyDescriptions.0.colorPrimaryId", 300],
      ["lithologyDescriptions.0.cementationId", 701],
      ["lithologyDescriptions.0.componentConMineralCodelistIds", [601]],
      ["lithologyDescriptions.0.componentConParticleCodelistIds", [703]],
      ["alterationDegreeId", 702],
    ]);
  });
});
