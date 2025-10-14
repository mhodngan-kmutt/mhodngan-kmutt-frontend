import i18next from "i18next";
import en from "./en.json";
import th from "./th.json";

i18next.init({
  lng: "en", // ค่าเริ่มต้น
  fallbackLng: "en",
  resources: {
    en: { translation: en },
    th: { translation: th },
  },
});

export default i18next;
