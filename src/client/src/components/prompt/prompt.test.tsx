// @vitest-environment jsdom
import { useContext, useEffect } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { cleanup, render, screen } from "@testing-library/react";
import { createInstance } from "i18next";
import { afterEach, describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { Prompt } from "./prompt.tsx";
import { PromptContext, PromptProvider } from "./promptContext.tsx";
import { PromptAction, PromptMessage } from "./promptInterface.ts";

const i18n = createInstance();
// Not awaited: the test harness only needs the resources registered synchronously.
void i18n.use(initReactI18next).init({
  lng: "en",
  resources: {
    en: {
      translation: {
        cancel: "cancel",
        confirmRemoveRole: "Remove the role of {{name}} in {{workgroupName}}?",
        exportFirstCount: "export first {{count}}",
      },
    },
  },
  interpolation: { escapeValue: false },
});

afterEach(() => {
  cleanup();
});

const ShowPromptOnMount = ({ message, actions }: { message: PromptMessage; actions: PromptAction[] }) => {
  const { showPrompt } = useContext(PromptContext);
  useEffect(() => {
    showPrompt(message, actions);
  }, [showPrompt, message, actions]);
  return null;
};

const renderPrompt = (message: PromptMessage, actions: PromptAction[]) =>
  render(
    <I18nextProvider i18n={i18n}>
      <PromptProvider>
        <ShowPromptOnMount message={message} actions={actions} />
        <Prompt />
      </PromptProvider>
    </I18nextProvider>,
  );

describe("Prompt", () => {
  it("translates a message key with its values", async () => {
    renderPrompt({ key: "confirmRemoveRole", values: { name: "Ada", workgroupName: "North" } }, [{ label: "cancel" }]);

    expect(await screen.findByText("Remove the role of Ada in North?")).toBeInTheDocument();
  });

  it("translates an action label with its values and keeps the data-cy of the key", async () => {
    renderPrompt("confirmRemoveRole", [{ label: "exportFirstCount", labelValues: { count: 500 } }]);

    const button = await screen.findByRole("button", { name: "Export first 500" });
    expect(button).toHaveAttribute("data-cy", "exportfirstcount-button");
  });
});
