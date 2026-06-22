import { describe, expect, it } from "vitest";
import { LithostratigraphyLayer } from "../../../../../../api/generated";
import { getLithostratigraphyColor } from "./getLithostratigraphyColor.ts";

const layerWithConf = (conf: string | null | undefined): LithostratigraphyLayer => ({
  id: 1,
  stratigraphyId: 1,
  fromDepth: 0,
  toDepth: 10,
  lithostratigraphyId: 1,
  lithostratigraphy: conf === undefined ? undefined : { id: 1, conf },
});

describe("getLithostratigraphyColor", () => {
  it("returns an rgb string when conf carries a color array", () => {
    expect(getLithostratigraphyColor(layerWithConf('{"color":[100,150,200]}'))).toBe("rgb(100,150,200)");
  });

  it("returns undefined when conf is null", () => {
    expect(getLithostratigraphyColor(layerWithConf(null))).toBeUndefined();
  });

  it("returns undefined when the lithostratigraphy relation is missing", () => {
    expect(getLithostratigraphyColor(layerWithConf(undefined))).toBeUndefined();
  });

  it("returns undefined when conf is malformed JSON", () => {
    expect(getLithostratigraphyColor(layerWithConf("not-json"))).toBeUndefined();
  });

  it("returns undefined when conf JSON has no color field", () => {
    expect(getLithostratigraphyColor(layerWithConf('{"other":"value"}'))).toBeUndefined();
  });

  it("returns undefined when color is not a 3-tuple", () => {
    expect(getLithostratigraphyColor(layerWithConf('{"color":[1,2]}'))).toBeUndefined();
    expect(getLithostratigraphyColor(layerWithConf('{"color":"red"}'))).toBeUndefined();
  });
});
