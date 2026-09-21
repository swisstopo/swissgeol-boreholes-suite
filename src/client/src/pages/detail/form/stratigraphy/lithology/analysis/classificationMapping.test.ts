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
