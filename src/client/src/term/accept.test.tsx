// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AcceptTerms } from "./accept";
import { buildConsentCookieValue, CONSENT_COOKIE_NAME } from "./consentCookie.ts";

vi.mock("../auth/useBoreholesAuth.tsx", () => ({
  useAuth: () => ({ user: signedInSubject === undefined ? undefined : { profile: { sub: signedInSubject } } }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("./disclaimerDialog", () => ({
  DisclaimerDialog: () => <div data-testid="disclaimer-dialog" />,
}));

let signedInSubject: string | undefined = undefined;

const setConsentCookie = (value: string) => {
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}`;
};

const renderAcceptTerms = () =>
  render(
    <AcceptTerms>
      <div data-testid="app-content" />
    </AcceptTerms>,
  );

const expectsConsent = (isPrompted: boolean) => {
  expect(screen.queryByTestId("disclaimer-dialog") !== null).toBe(isPrompted);
  expect(screen.queryByTestId("app-content") !== null).toBe(!isPrompted);
};

describe("AcceptTerms", () => {
  afterEach(() => {
    cleanup();
    signedInSubject = undefined;
    document.cookie = `${CONSENT_COOKIE_NAME}=; Max-Age=0`;
  });

  it("prompts when no consent was stored", () => {
    signedInSubject = "user-a";
    renderAcceptTerms();
    expectsConsent(true);
  });

  it("does not prompt when the signed-in user accepted the current terms", () => {
    signedInSubject = "user-a";
    setConsentCookie(buildConsentCookieValue("user-a", true));
    renderAcceptTerms();
    expectsConsent(false);
  });

  it("prompts another user signing in on the same browser", () => {
    signedInSubject = "user-b";
    setConsentCookie(buildConsentCookieValue("user-a", true));
    renderAcceptTerms();
    expectsConsent(true);
  });

  it("does not prompt an anonymous visitor who already accepted", () => {
    setConsentCookie(buildConsentCookieValue(undefined, true));
    renderAcceptTerms();
    expectsConsent(false);
  });

  it("prompts an anonymous visitor who has not accepted", () => {
    renderAcceptTerms();
    expectsConsent(true);
  });

  it("prompts a signed-in user when only an anonymous consent is stored", () => {
    signedInSubject = "user-a";
    setConsentCookie(buildConsentCookieValue(undefined, true));
    renderAcceptTerms();
    expectsConsent(true);
  });

  it("prompts again when the terms changed since the consent was stored", () => {
    signedInSubject = "user-a";
    const outdated = JSON.parse(decodeURIComponent(buildConsentCookieValue("user-a", true)));
    setConsentCookie(encodeURIComponent(JSON.stringify({ ...outdated, terms: outdated.terms - 1 })));
    renderAcceptTerms();
    expectsConsent(true);
  });

  it("prompts again when the cookie schema changed", () => {
    signedInSubject = "user-a";
    const outdated = JSON.parse(decodeURIComponent(buildConsentCookieValue("user-a", true)));
    setConsentCookie(encodeURIComponent(JSON.stringify({ ...outdated, v: outdated.v - 1 })));
    renderAcceptTerms();
    expectsConsent(true);
  });

  it("prompts when the cookie cannot be parsed", () => {
    signedInSubject = "user-a";
    setConsentCookie("not-json");
    renderAcceptTerms();
    expectsConsent(true);
  });
});
