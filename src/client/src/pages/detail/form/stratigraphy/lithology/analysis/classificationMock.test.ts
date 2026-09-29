import { describe, expect, it } from "vitest";
import { Codelist } from "../../../../../../api/generated";
import { attributeRegistry, findCodelistId } from "./classificationMapping.ts";
import { consolidatedFixture, mockClassify, unconsolidatedFixture } from "./classificationMock.ts";

const codelist = (schema: string, code: string, en: string, id: number): Codelist => ({ id, schema, code, en });

// The entries the two fixtures have to resolve to, copied from the seeded codelists.
const codelists: Codelist[] = [
  codelist("lithology_uncon_main", "MGr", "medium gravel", 100),
  codelist("lithology_uncon_secondary", "fsa", "fine sand", 110),
  codelist("lithology_uncon_secondary", "si", "silt", 111),
  codelist("lithology_uncon_secondary", "co", "cobbles", 112),
  codelist("lithology_uncon_secondary", "or", "organic soil", 113),
  codelist("uscs_type", "GP-GC", "", 200),
  codelist("color", "", "light grey", 300),
  codelist("component_uncon_organic", "", "remains of wood", 400),
  codelist("grain_angularity", "", "well rounded", 500),
  codelist("grain_shape", "", "platy", 510),
  codelist("component_uncon_debris", "", "rubble", 520),
  codelist("component_uncon_debris", "", "fragments, splitters", 521),
  codelist("lithology_con", "", "sandstone", 700),
  codelist("cementation", "", "well cemented", 701),
  codelist("alteration_degree", "", "moderately weathered", 702),
  codelist("component_con_mineral", "", "biotite", 703),
  codelist("component_con_particle", "", "biodetritus", 704),
];

const fixtureValues = (fixture: Record<string, unknown>): [string, string][] =>
  attributeRegistry
    .filter(entry => entry.apiKey in fixture)
    .flatMap(entry => {
      const raw = fixture[entry.apiKey];
      const values = Array.isArray(raw) ? raw : [raw];
      return values
        .filter((value): value is string => typeof value === "string")
        .map(value => [entry.schema, value] as [string, string]);
    });

describe("the mock fixtures", () => {
  it("resolve every unconsolidated value to a codelist id", () => {
    for (const [schema, value] of fixtureValues(unconsolidatedFixture as Record<string, unknown>)) {
      const entry = attributeRegistry.find(candidate => candidate.schema === schema);
      expect(findCodelistId(codelists, schema, entry!.match, value), `${schema}: ${value}`).toBeDefined();
    }
  });

  it("resolve every consolidated value to a codelist id", () => {
    for (const [schema, value] of fixtureValues(consolidatedFixture as Record<string, unknown>)) {
      const entry = attributeRegistry.find(candidate => candidate.schema === schema);
      expect(findCodelistId(codelists, schema, entry!.match, value), `${schema}: ${value}`).toBeDefined();
    }
  });
});

describe("mockClassify", () => {
  it("returns the consolidated fixture for a consolidated rock description", async () => {
    await expect(mockClassify("Sandstein, siltig, mit Biotit")).resolves.toEqual(consolidatedFixture);
  });

  it("returns the unconsolidated fixture by default", async () => {
    await expect(mockClassify("Mittelkies, gut gerundet, feinsandig")).resolves.toEqual(unconsolidatedFixture);
  });

  it("returns an empty response for an unclassifiable description", async () => {
    await expect(mockClassify("keine Angabe")).resolves.toEqual({});
  });

  it("rejects for a description that asks for the error path", async () => {
    await expect(mockClassify("Fehler bitte")).rejects.toThrow();
  });
});
