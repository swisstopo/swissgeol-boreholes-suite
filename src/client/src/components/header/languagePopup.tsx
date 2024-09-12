import { useEffect, useState } from "react";
import i18n from "../../i18n";
import { Language } from "../../appInterfaces";
import { ButtonSelect } from "../buttons/buttonSelect.tsx";

const defaultLanguage = Language.DE;

export function LanguagePopup() {
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const languages: string[] = Object.values(Language);

  useEffect(() => {
    const handleLanguageChange = () => {
      const languageIndex = languages.indexOf(i18n.language);
      if (languageIndex !== -1) {
        setSelectedLanguage(languages[languageIndex] as Language);
      } else {
        setSelectedLanguage(defaultLanguage);
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
