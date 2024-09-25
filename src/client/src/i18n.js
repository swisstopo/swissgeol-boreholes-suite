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
      order: ["cookie", "htmlTag"], //, 'navigator'],

      // keys or params to lookup language from
      lookupCookie: "i18next",

      // cache user language on
      caches: ["cookie"],

      // optional set cookie options, reference:[MDN Set-Cookie docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
      // cookieOptions: { path: '/', sameSite: 'strict' }
    },
    backend: {
      loadPath: `/locale/{{lng}}/{{ns}}.json`,
      allowMultiLoading: false,
      queryStringParams: { v: "1.0.0" },
    },
    react: {
      useSuspense: false,
    },
    // fallbackLng: "en",
    // lng: "en", // if set, the languagedetector won't work
    // fallbackLng: {
    //   'en': ['en-US'],
    //   'default': ['en']
    // },
    supportedLngs: ["en", "it", "de", "fr"],
    // preload: ['en'],
    whitelist: ["en", "it", "de", "fr"],
    ns: ["common"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
      formatSeparator: ",",
    },
  });

export default i18n;
