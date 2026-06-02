// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FaciesDescription } from "../../faciesDescription.ts";
import { LithologicalDescription } from "../../lithologicalDescription.ts";
import { Lithology } from "../../lithology.ts";
import { useLithologyTableState } from "./useLithologyTableState.ts";

const lithology = (overrides: Partial<Lithology> = {}): Lithology => ({
  id: 0,
  stratigraphyId: 1,
  fromDepth: 0,
  toDepth: 0,
  isUnconsolidated: true,
  hasBedding: false,
  ...overrides,
});

const lithologicalDescription = (overrides: Partial<LithologicalDescription> = {}): LithologicalDescription => ({
  id: 0,
  stratigraphyId: 1,
  fromDepth: 0,
  toDepth: 0,
  ...overrides,
});

const faciesDescription = (overrides: Partial<FaciesDescription> = {}): FaciesDescription => ({
  id: 0,
  stratigraphyId: 1,
  fromDepth: 0,
  toDepth: 0,
  faciesId: null,
  ...overrides,
});

interface HookProps {
  lithologies: Lithology[];
  lithologicalDescriptions: LithologicalDescription[];
  faciesDescriptions: FaciesDescription[];
  stratigraphyId: number;
}

const renderState = (initial: Partial<HookProps> = {}) =>
  renderHook(
    ({ lithologies, lithologicalDescriptions, faciesDescriptions, stratigraphyId }: HookProps) =>
      useLithologyTableState(lithologies, lithologicalDescriptions, faciesDescriptions, stratigraphyId),
    {
      initialProps: {
        lithologies: [],
        lithologicalDescriptions: [],
        faciesDescriptions: [],
        stratigraphyId: 1,
        ...initial,
      },
    },
  );

describe("useLithologyTableState", () => {
  describe("seed", () => {
    it("starts empty when given no data", () => {
      const { result } = renderState();
      expect(result.current.depths).toEqual([]);
      expect(result.current.tmpLithologies).toEqual([]);
      expect(result.current.tmpLithologicalDescriptions).toEqual([]);
      expect(result.current.tmpFaciesDescriptions).toEqual([]);
      expect(result.current.hasErrors).toBe(false);
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it("seeds depth rows from contiguous lithologies", () => {
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 50 }),
          lithology({ id: 2, fromDepth: 50, toDepth: 100 }),
        ],
      });
      expect(result.current.depths).toHaveLength(2);
      expect(result.current.depths[0]).toMatchObject({ fromDepth: 0, toDepth: 50 });
      expect(result.current.depths[1]).toMatchObject({ fromDepth: 50, toDepth: 100 });
      // each lithology owns its single depth row
      expect(result.current.tmpLithologies[0].depthIds).toEqual([result.current.depths[0].id]);
      expect(result.current.tmpLithologies[1].depthIds).toEqual([result.current.depths[1].id]);
    });

    it("clamps overlapping lithologies and flags them as auto-corrected", () => {
      const { result } = renderState({
        // (0,30) overlaps (10,40). cleanupOverlaps sorts by fromDepth and clamps the first.
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 30 }),
          lithology({ id: 2, fromDepth: 10, toDepth: 40 }),
        ],
      });
      const first = result.current.tmpLithologies.find(l => l.id === 1)!;
      expect(first.toDepth).toBe(10);
      expect(first.isAutoCorrected).toBe(true);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it("does not flag unsaved changes when input lithologies need no correction", () => {
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 50 }),
          lithology({ id: 2, fromDepth: 50, toDepth: 100 }),
        ],
      });
      expect(result.current.tmpLithologies.every(l => !l.isAutoCorrected)).toBe(true);
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it("fills lithology gaps with empty auto-corrected lithologies", () => {
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 30 }),
          lithology({ id: 2, fromDepth: 50, toDepth: 100 }),
        ],
      });

      expect(result.current.tmpLithologies.length).toEqual(3);
      const gapFiller = result.current.tmpLithologies.find(l => l.fromDepth === 30 && l.toDepth === 50);
      expect(gapFiller).toBeDefined();
      expect(gapFiller!.id).toBe(0); // new, unsaved
      expect(gapFiller!.isAutoCorrected).toBe(true);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it("introduces depth boundaries from descriptions even when no lithology owns them", () => {
      // No lithologies; facies descriptions span 0-50 and 50-100. The fillLithologyGaps step
      // extends lithology coverage to match, so depths still come out as two rows.
      const { result } = renderState({
        faciesDescriptions: [
          faciesDescription({ id: 10, fromDepth: 0, toDepth: 50 }),
          faciesDescription({ id: 11, fromDepth: 50, toDepth: 100 }),
        ],
      });
      expect(result.current.depths.map(d => [d.fromDepth, d.toDepth])).toEqual([
        [0, 50],
        [50, 100],
      ]);
      expect(result.current.tmpLithologies.length).toEqual(2);
      expect(result.current.tmpLithologies[0].fromDepth).toEqual(0);
      expect(result.current.tmpLithologies[0].toDepth).toEqual(50);
      expect(result.current.tmpLithologies[0].isAutoCorrected).toEqual(true);
      expect(result.current.tmpLithologies[1].fromDepth).toEqual(50);
      expect(result.current.tmpLithologies[1].toDepth).toEqual(100);
      expect(result.current.tmpLithologies[1].isAutoCorrected).toEqual(true);
    });

    it("flags every depth row that a single lithology spans across multiple rows", () => {
      // One lithology 0-100, but two facies descriptions (0-50) and (50-100) cut a boundary
      // at 50. The lithology now spans both depth rows -> both rows flagged.
      const { result } = renderState({
        lithologies: [lithology({ id: 1, fromDepth: 0, toDepth: 100 })],
        faciesDescriptions: [
          faciesDescription({ id: 10, fromDepth: 0, toDepth: 50 }),
          faciesDescription({ id: 11, fromDepth: 50, toDepth: 100 }),
        ],
      });
      expect(result.current.depths).toHaveLength(2);
      expect(result.current.depths.every(d => d.hasFromDepthError && d.hasToDepthError)).toBe(true);
      expect(result.current.hasErrors).toBe(true);
      expect(result.current.tmpLithologies.length).toEqual(1);
      expect(result.current.tmpLithologies[0].fromDepth).toEqual(0);
      expect(result.current.tmpLithologies[0].toDepth).toEqual(100);
    });

    it("flags zero-thickness depth rows", () => {
      // Two lithologies sharing the same boundary in a strict (X,X) zt sense — produced
      // here by a fromDepth === toDepth lithology.
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 50 }),
          lithology({ id: 2, fromDepth: 50, toDepth: 50 }),
          lithology({ id: 3, fromDepth: 50, toDepth: 100 }),
        ],
      });
      const zt = result.current.depths.find(d => d.fromDepth === 50 && d.toDepth === 50);
      expect(zt).toBeDefined();
      expect(zt!.hasFromDepthError).toBe(true);
      expect(zt!.hasToDepthError).toBe(true);
      expect(result.current.hasErrors).toBe(true);
    });
  });

  describe("updateDepthBoundaries", () => {
    it("moves a shared boundary on both neighboring depth rows and their lithologies", () => {
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 50 }),
          lithology({ id: 2, fromDepth: 50, toDepth: 100 }),
        ],
      });
      const firstDepthId = result.current.depths[0].id;
      act(() => result.current.updateDepthBoundaries(firstDepthId, "to", 60));
      expect(result.current.depths[0]).toMatchObject({ fromDepth: 0, toDepth: 60 });
      expect(result.current.depths[1]).toMatchObject({ fromDepth: 60, toDepth: 100 });
      expect(result.current.tmpLithologies.find(l => l.id === 1)!.toDepth).toBe(60);
      expect(result.current.tmpLithologies.find(l => l.id === 2)!.fromDepth).toBe(60);
    });

    it("moves only the first depth's fromDepth when the side is 'from' and there is no prev", () => {
      const { result } = renderState({ lithologies: [lithology({ id: 1, fromDepth: 0, toDepth: 50 })] });
      const id = result.current.depths[0].id;
      act(() => result.current.updateDepthBoundaries(id, "from", 5));
      expect(result.current.depths[0]).toMatchObject({ fromDepth: 5, toDepth: 50 });
      expect(result.current.tmpLithologies[0].fromDepth).toBe(5);
    });

    it("moves only the last depth's toDepth when the side is 'to' and there is no next", () => {
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 50 }),
          lithology({ id: 2, fromDepth: 50, toDepth: 100 }),
        ],
      });
      const lastId = result.current.depths[1].id;
      act(() => result.current.updateDepthBoundaries(lastId, "to", 120));
      // First row untouched, last row's toDepth shifted (no propagation since there's no next).
      expect(result.current.depths[0]).toMatchObject({ fromDepth: 0, toDepth: 50 });
      expect(result.current.depths[1]).toMatchObject({ fromDepth: 50, toDepth: 120 });
      expect(result.current.tmpLithologies.find(l => l.id === 1)!.toDepth).toBe(50);
      expect(result.current.tmpLithologies.find(l => l.id === 2)!.toDepth).toBe(120);
    });

    it("does nothing when the new value equals the current boundary", () => {
      const { result } = renderState({ lithologies: [lithology({ id: 1, fromDepth: 0, toDepth: 50 })] });
      const before = result.current.depths;
      const id = before[0].id;
      act(() => result.current.updateDepthBoundaries(id, "to", 50));
      expect(result.current.depths).toBe(before); // same array reference — nothing was committed
      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });

  describe("handleAddDepthLayer", () => {
    it("creates a (0,0) zero-thickness row and an empty lithology on an empty stratigraphy", () => {
      const { result } = renderState();
      act(() => result.current.handleAddDepthLayer());
      expect(result.current.depths).toHaveLength(1);
      expect(result.current.depths[0]).toMatchObject({ fromDepth: 0, toDepth: 0 });
      expect(result.current.tmpLithologies).toHaveLength(1);
      expect(result.current.tmpLithologies[0].id).toBe(0);
      expect(result.current.tmpLithologies[0].isUnconsolidated).toBe(true);
      expect(result.current.tmpLithologies[0].isAutoCorrected).toBe(false);
    });

    it("appends a (lastTo,lastTo) zero-thickness row inheriting isUnconsolidated", () => {
      const { result } = renderState({
        lithologies: [lithology({ id: 1, fromDepth: 0, toDepth: 50, isUnconsolidated: false })],
      });
      act(() => result.current.handleAddDepthLayer());
      const added = result.current.depths.at(-1)!;
      expect(added).toMatchObject({ fromDepth: 50, toDepth: 50 });
      const addedLithology = result.current.tmpLithologies.at(-1)!;
      expect(addedLithology.isUnconsolidated).toBe(false);
      expect(addedLithology.isAutoCorrected).toBe(false);
    });
  });

  describe("handleInsertDepthRow", () => {
    it("inserts a zero-thickness row at the upper boundary on 'before'", () => {
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 50 }),
          lithology({ id: 2, fromDepth: 50, toDepth: 100 }),
        ],
      });
      const adjacentId = result.current.depths[1].id; // second row (50,100)
      act(() => result.current.handleInsertDepthRow(adjacentId, "before"));
      expect(result.current.depths).toHaveLength(3);
      expect(result.current.depths[1]).toMatchObject({ fromDepth: 50, toDepth: 50 });
    });

    it("inherits isUnconsolidated from the row directly above the new zt on 'before'", () => {
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 50, isUnconsolidated: false }),
          lithology({ id: 2, fromDepth: 50, toDepth: 100, isUnconsolidated: true }),
        ],
      });
      // Insert before row 2 (50,100). The row above is row 1 (consolidated → false).
      act(() => result.current.handleInsertDepthRow(result.current.depths[1].id, "before"));
      const newLithology = result.current.tmpLithologies.find(l => l.fromDepth === 50 && l.toDepth === 50)!;
      expect(newLithology.isUnconsolidated).toBe(false);
    });

    it("inherits isUnconsolidated from the row above on 'after' (= adjacent row)", () => {
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 50, isUnconsolidated: false }),
          lithology({ id: 2, fromDepth: 50, toDepth: 100, isUnconsolidated: true }),
        ],
      });
      // Insert after row 1 (0,50). The row above the new zt is row 1 itself (consolidated).
      act(() => result.current.handleInsertDepthRow(result.current.depths[0].id, "after"));
      const newLithology = result.current.tmpLithologies.find(l => l.fromDepth === 50 && l.toDepth === 50)!;
      expect(newLithology.isUnconsolidated).toBe(false);
    });

    it("defaults to isUnconsolidated=true when inserting before the very first row", () => {
      const { result } = renderState({
        lithologies: [lithology({ id: 1, fromDepth: 0, toDepth: 50, isUnconsolidated: false })],
      });
      act(() => result.current.handleInsertDepthRow(result.current.depths[0].id, "before"));
      // No row above → defaults to true.
      const newLithology = result.current.tmpLithologies.find(l => l.fromDepth === 0 && l.toDepth === 0)!;
      expect(newLithology.isUnconsolidated).toBe(true);
    });

    it("folds the new depthId into descriptions that span the insertion boundary, sorted by depth order", () => {
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 50 }),
          lithology({ id: 2, fromDepth: 50, toDepth: 100 }),
        ],
        lithologicalDescriptions: [
          lithologicalDescription({ id: 10, fromDepth: 0, toDepth: 100, description: "spanning" }),
        ],
      });
      const aboveId = result.current.depths[0].id;
      const belowId = result.current.depths[1].id;
      expect(result.current.tmpLithologicalDescriptions[0].depthIds).toEqual([aboveId, belowId]);

      act(() => result.current.handleInsertDepthRow(result.current.depths[1].id, "before"));

      const newRow = result.current.depths[1]; // the inserted zt now sits between
      const updatedDescription = result.current.tmpLithologicalDescriptions[0];
      expect(updatedDescription.depthIds).toEqual([aboveId, newRow.id, belowId]); // sorted top-to-bottom
    });

    it("does NOT extend descriptions whose range only touches the boundary", () => {
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 50 }),
          lithology({ id: 2, fromDepth: 50, toDepth: 100 }),
        ],
        lithologicalDescriptions: [lithologicalDescription({ id: 10, fromDepth: 0, toDepth: 50 })],
      });
      const aboveId = result.current.depths[0].id;
      const before = result.current.tmpLithologicalDescriptions[0].depthIds;
      expect(before).toEqual([aboveId]);

      act(() => result.current.handleInsertDepthRow(result.current.depths[1].id, "before"));
      // The description ends at the boundary — it doesn't span across it.
      expect(result.current.tmpLithologicalDescriptions[0].depthIds).toEqual([aboveId]);
    });
  });

  describe("handleDeleteDepthLayer", () => {
    it("clears everything when the table has a single row", () => {
      const { result } = renderState({ lithologies: [lithology({ id: 1, fromDepth: 0, toDepth: 50 })] });
      const id = result.current.depths[0].id;
      act(() => result.current.handleDeleteDepthLayer(id, "extendLower"));
      expect(result.current.depths).toEqual([]);
      expect(result.current.tmpLithologies).toEqual([]);
    });

    it("extends the upper neighbor down ('extendUpper') and drops the deleted lithology", () => {
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 50 }),
          lithology({ id: 2, fromDepth: 50, toDepth: 100 }),
          lithology({ id: 3, fromDepth: 100, toDepth: 150 }),
        ],
      });
      const middleId = result.current.depths[1].id;
      act(() => result.current.handleDeleteDepthLayer(middleId, "extendUpper"));
      expect(result.current.depths).toHaveLength(2);
      expect(result.current.depths[0]).toMatchObject({ fromDepth: 0, toDepth: 100 });
      expect(result.current.depths[1]).toMatchObject({ fromDepth: 100, toDepth: 150 });
      expect(result.current.tmpLithologies.find(l => l.id === 2)).toBeUndefined();
      expect(result.current.tmpLithologies.find(l => l.id === 1)!.toDepth).toBe(100);
    });

    it("extends the lower neighbor up ('extendLower') and drops the deleted lithology", () => {
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 50 }),
          lithology({ id: 2, fromDepth: 50, toDepth: 100 }),
          lithology({ id: 3, fromDepth: 100, toDepth: 150 }),
        ],
      });
      const middleId = result.current.depths[1].id;
      act(() => result.current.handleDeleteDepthLayer(middleId, "extendLower"));
      expect(result.current.depths).toHaveLength(2);
      expect(result.current.depths[0]).toMatchObject({ fromDepth: 0, toDepth: 50 });
      expect(result.current.depths[1]).toMatchObject({ fromDepth: 50, toDepth: 150 });
      expect(result.current.tmpLithologies.find(l => l.id === 3)!.fromDepth).toBe(50);
    });

    it("shrinks the borehole end ('reduceBoreholeEnd') without affecting the neighbor", () => {
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 50 }),
          lithology({ id: 2, fromDepth: 50, toDepth: 100 }),
        ],
      });
      const lastId = result.current.depths[1].id;
      act(() => result.current.handleDeleteDepthLayer(lastId, "reduceBoreholeEnd"));
      expect(result.current.depths).toHaveLength(1);
      expect(result.current.depths[0]).toMatchObject({ fromDepth: 0, toDepth: 50 });
    });

    it("raises the borehole start ('raiseBoreholeStart') without affecting the neighbor", () => {
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 50 }),
          lithology({ id: 2, fromDepth: 50, toDepth: 100 }),
        ],
      });
      const firstId = result.current.depths[0].id;
      act(() => result.current.handleDeleteDepthLayer(firstId, "raiseBoreholeStart"));
      expect(result.current.depths).toHaveLength(1);
      expect(result.current.depths[0]).toMatchObject({ fromDepth: 50, toDepth: 100 });
      expect(result.current.tmpLithologies.find(l => l.id === 1)).toBeUndefined();
      expect(result.current.tmpLithologies.find(l => l.id === 2)!.fromDepth).toBe(50);
    });
  });

  describe("handleDeleteDescription", () => {
    it("removes the description and leaves shared depth rows alone", () => {
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 50 }),
          lithology({ id: 2, fromDepth: 50, toDepth: 100 }),
        ],
        lithologicalDescriptions: [lithologicalDescription({ id: 10, fromDepth: 0, toDepth: 50 })],
      });
      expect(result.current.depths).toHaveLength(2);

      act(() => result.current.handleDeleteDescription("lithological", 0));
      // The depth row (0,50) is still owned by lithology 1 → no merge.
      expect(result.current.depths).toHaveLength(2);
      expect(result.current.tmpLithologicalDescriptions).toEqual([]);
    });
  });

  describe("resizeDescription", () => {
    it("grows a description across an adjacent gap row", () => {
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 50 }),
          lithology({ id: 2, fromDepth: 50, toDepth: 100 }),
        ],
        lithologicalDescriptions: [lithologicalDescription({ id: 10, fromDepth: 0, toDepth: 50 })],
      });
      const initialDepthIds = result.current.tmpLithologicalDescriptions[0].depthIds!;
      expect(initialDepthIds).toHaveLength(1);

      act(() => result.current.resizeDescription("lithological", 0, 0, 100));
      const grown = result.current.tmpLithologicalDescriptions[0];
      expect(grown.fromDepth).toBe(0);
      expect(grown.toDepth).toBe(100);
      expect(grown.depthIds).toHaveLength(2);
      expect(grown.depthIds).toEqual([result.current.depths[0].id, result.current.depths[1].id]);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it("shrinks a description so the formerly-owned row becomes a gap", () => {
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 50 }),
          lithology({ id: 2, fromDepth: 50, toDepth: 100 }),
        ],
        lithologicalDescriptions: [lithologicalDescription({ id: 10, fromDepth: 0, toDepth: 100 })],
      });
      expect(result.current.tmpLithologicalDescriptions[0].depthIds).toHaveLength(2);

      act(() => result.current.resizeDescription("lithological", 0, 0, 50));
      const shrunk = result.current.tmpLithologicalDescriptions[0];
      expect(shrunk.toDepth).toBe(50);
      expect(shrunk.depthIds).toEqual([result.current.depths[0].id]);
      // depth array unchanged; the (50,100) row is still there, just not in the description.
      expect(result.current.depths).toHaveLength(2);
    });

    it("rejects a resize that would cross a sibling description", () => {
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 50 }),
          lithology({ id: 2, fromDepth: 50, toDepth: 100 }),
          lithology({ id: 3, fromDepth: 100, toDepth: 150 }),
        ],
        lithologicalDescriptions: [
          lithologicalDescription({ id: 10, fromDepth: 0, toDepth: 50 }),
          // Sibling description sitting in the middle row (50,100) — blocks expansion.
          lithologicalDescription({ id: 11, fromDepth: 50, toDepth: 100 }),
        ],
      });
      const before = result.current.tmpLithologicalDescriptions[0];
      act(() => result.current.resizeDescription("lithological", 0, 0, 100));
      // Sibling row (50,100) is owned by desc id:11 → resize is rejected, state unchanged.
      expect(result.current.tmpLithologicalDescriptions[0]).toBe(before);
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it("picks up multiple gap rows in one resize and keeps depthIds sorted top-to-bottom", () => {
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 30 }),
          lithology({ id: 2, fromDepth: 30, toDepth: 60 }),
          lithology({ id: 3, fromDepth: 60, toDepth: 100 }),
        ],
        lithologicalDescriptions: [lithologicalDescription({ id: 10, fromDepth: 0, toDepth: 30 })],
      });
      act(() => result.current.resizeDescription("lithological", 0, 0, 100));
      const grown = result.current.tmpLithologicalDescriptions[0];
      expect(grown.depthIds).toEqual([
        result.current.depths[0].id,
        result.current.depths[1].id,
        result.current.depths[2].id,
      ]);
    });
  });

  describe("updateTmp* (modal apply)", () => {
    it("ignores updates when hasChanges is false", () => {
      const { result } = renderState({ lithologies: [lithology({ id: 1, fromDepth: 0, toDepth: 50 })] });
      const before = result.current.tmpLithologies;
      act(() => result.current.updateTmpLithology({ ...before[0], notes: "x" }, false));
      expect(result.current.tmpLithologies).toBe(before);
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it("replaces an existing tmp item by structural match (depths + depthIds)", () => {
      const { result } = renderState({ lithologies: [lithology({ id: 1, fromDepth: 0, toDepth: 50 })] });
      const original = result.current.tmpLithologies[0];
      act(() => result.current.updateTmpLithology({ ...original, notes: "edited" }, true));
      expect(result.current.tmpLithologies).toHaveLength(1);
      expect(result.current.tmpLithologies[0].notes).toBe("edited");
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it("appends a new description from a gap-click apply, sorted into depth order", () => {
      const { result } = renderState({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 50 }),
          lithology({ id: 2, fromDepth: 50, toDepth: 100 }),
        ],
        lithologicalDescriptions: [
          lithologicalDescription({ id: 10, fromDepth: 50, toDepth: 100, description: "second" }),
        ],
      });
      const firstDepthId = result.current.depths[0].id;
      act(() =>
        result.current.updateTmpLithologicalDescription(
          { id: 0, stratigraphyId: 1, fromDepth: 0, toDepth: 50, depthIds: [firstDepthId], description: "first" },
          true,
        ),
      );
      const descriptions = result.current.tmpLithologicalDescriptions;
      expect(descriptions).toHaveLength(2);
      // Sorted by first depthId position in the depths array (0 before 1).
      expect(descriptions[0].description).toBe("first");
      expect(descriptions[1].description).toBe("second");
    });
  });

  describe("hasUnsavedChanges + reset", () => {
    it("flips to true on any structural edit and back to false on reset", () => {
      const { result } = renderState({ lithologies: [lithology({ id: 1, fromDepth: 0, toDepth: 50 })] });
      expect(result.current.hasUnsavedChanges).toBe(false);

      act(() => result.current.handleAddDepthLayer());
      expect(result.current.hasUnsavedChanges).toBe(true);

      act(() => result.current.reset());
      expect(result.current.depths).toHaveLength(1);
      expect(result.current.tmpLithologies).toHaveLength(1);
      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });

  describe("re-seed on input change", () => {
    it("re-seeds when the input content changes", () => {
      const lithologies = [lithology({ id: 1, fromDepth: 0, toDepth: 50 })];
      const { result, rerender } = renderState({ lithologies: lithologies });
      expect(result.current.depths).toHaveLength(1);

      // After a "save+refetch" the parent passes a new set of lithologies.
      rerender({
        lithologies: [
          lithology({ id: 1, fromDepth: 0, toDepth: 50 }),
          lithology({ id: 2, fromDepth: 50, toDepth: 100 }),
        ],
        lithologicalDescriptions: [],
        faciesDescriptions: [],
        stratigraphyId: 1,
      });
      expect(result.current.depths).toHaveLength(2);
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it("does NOT re-seed (and preserves local edits) when the props ref changes but content is identical", () => {
      const lithologies = [lithology({ id: 1, fromDepth: 0, toDepth: 50 })];
      const { result, rerender } = renderState({ lithologies: lithologies });
      act(() => result.current.handleAddDepthLayer());
      expect(result.current.depths).toHaveLength(2);
      expect(result.current.hasUnsavedChanges).toBe(true);

      // Same data values, but a fresh array — this is what react-query hands back when it
      // re-fetches and the server returns identical data (e.g. on window focus).
      rerender({
        lithologies: [lithology({ id: 1, fromDepth: 0, toDepth: 50 })],
        lithologicalDescriptions: [],
        faciesDescriptions: [],
        stratigraphyId: 1,
      });
      // The local in-flight edit must survive.
      expect(result.current.depths).toHaveLength(2);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });
});
