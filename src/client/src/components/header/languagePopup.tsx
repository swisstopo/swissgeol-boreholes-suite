import { useEffect, useState } from "react";
import { Language, SwissgeolCoreI18n } from "@swissgeol/ui-core";
import i18n from "../../i18n";
import { ButtonSelect } from "../buttons/buttonSelect.tsx";

const defaultLanguage = Language.German;

export function LanguagePopup() {
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const languages: string[] = Object.values(Language);

  useEffect(() => {
    const handleLanguageChange = () => {
      const languageIndex = languages.indexOf(i18n.language);
      if (languageIndex !== -1) {
        setSelectedLanguage(languages[languageIndex] as Language);
        SwissgeolCoreI18n.setLanguage(languages[languageIndex] as Language);
      } else {
        setSelectedLanguage(defaultLanguage);
        SwissgeolCoreI18n.setLanguage(defaultLanguage as Language);
      }
    };
    handleLanguageChange();

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLanguageChanged = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <ButtonSelect
      fieldName="language"
      items={[...languages.map(language => ({ key: language, value: language.toUpperCase() }))]}
      selectedItem={{ key: selectedLanguage, value: selectedLanguage.toUpperCase() }}
      onItemSelected={item => onLanguageChanged(item.key as string)}
      textAlign="right"
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    />
  );
}
