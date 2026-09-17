// @vitest-environment jsdom
import { FC, useContext, useEffect } from "react";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SaveContext, SaveProvider } from "./saveContext.tsx";

vi.mock("react-router", () => ({
  useLocation: () => ({ pathname: "/" }),
}));

/** Registers a save handler the way a form panel does, and reports what the context exposes. */
const Panel: FC<{ save: () => Promise<boolean> }> = ({ save }) => {
  const { registerSaveHandler, registerResetHandler, setHasChanges, triggerSave, isSaving } = useContext(SaveContext);

  useEffect(() => {
    registerSaveHandler(save);
    registerResetHandler(() => {});
    setHasChanges(true);
  }, [registerResetHandler, registerSaveHandler, save, setHasChanges]);

  return (
    <button type="button" onClick={triggerSave} data-cy="save">
      {isSaving ? "saving" : "idle"}
    </button>
  );
};

/** A save that stays in flight until the test lets it finish. */
const pendingSave = () => {
  let finish: (saved: boolean) => void = () => {};
  const handler = vi.fn(
    () =>
      new Promise<boolean>(resolve => {
        finish = resolve;
      }),
  );

  return { handler, finish: (saved: boolean) => finish(saved) };
};

describe("SaveProvider", () => {
  afterEach(cleanup);

  it("saves on ctrl+s while the panel holds changes", async () => {
    const { handler, finish } = pendingSave();
    render(
      <SaveProvider>
        <Panel save={handler} />
      </SaveProvider>,
    );

    fireEvent.keyDown(window, { key: "s", ctrlKey: true });

    await waitFor(() => expect(handler).toHaveBeenCalledTimes(1));

    await act(async () => finish(true));
  });

  it("does not start a second save while the first is still running", async () => {
    // The overlay shown during a save covers the page, but it takes pointer events only: the
    // shortcut listens on the window and stays registered for as long as the panel holds changes.
    const { handler, finish } = pendingSave();
    render(
      <SaveProvider>
        <Panel save={handler} />
      </SaveProvider>,
    );

    fireEvent.keyDown(window, { key: "s", ctrlKey: true });
    await waitFor(() => expect(handler).toHaveBeenCalledTimes(1));

    fireEvent.keyDown(window, { key: "s", ctrlKey: true });

    expect(handler).toHaveBeenCalledTimes(1);

    await act(async () => finish(true));
  });
});
