import { initReactI18next } from "react-i18next";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";

i18n
  .use(initReactI18next)
  .use(HttpApi)
  .use(LanguageDetector)
  .init({
    detection: {
      order: ["querystring", "cookie", "localStorage", "sessionStorage", "navigator", "htmlTag"],
      lookupQuerystring: "lng",
      lookupCookie: "i18next",
      lookupLocalStorage: "i18nextLng",
      lookupSessionStorage: "i18nextLng",
      caches: ["localStorage"],
    },
    backend: {
      loadPath: `/locale/{{lng}}/{{ns}}.json`,
      queryStringParams: { v: "1.0.0" },
    },
    react: {
      useSuspense: false,
    },
    fallbackLng: "en",
    supportedLngs: ["de", "en", "fr", "it"],
    ns: ["common"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
      formatSeparator: ",",
    },
  });

export default i18n;
