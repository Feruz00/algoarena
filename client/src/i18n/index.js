import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ru from "./locales/ru.json";
import tm from "./locales/tm.json";

const storedLanguage = (() => {
  try {
    return localStorage.getItem("oj-language") || "tm";
  } catch {
    return "tm";
  }
})();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    tm: { translation: tm },
  },
  lng: storedLanguage,
  fallbackLng: "tm",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (language) => {
  try {
    localStorage.setItem("oj-language", language);
  } catch {}
});

export default i18n;
