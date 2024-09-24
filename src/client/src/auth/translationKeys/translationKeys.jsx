import { useEffect, useState } from "react";
import { withTranslation } from "react-i18next";

import * as Styled from "./styles.js";

const TranslationKeys = prop => {
  const [selectedLanguage, setSelectedLanguage] = useState();

  const languages = [
    { id: 0, language: "de" },
    { id: 1, language: "fr" },
    { id: 2, language: "it" },
    { id: 3, language: "en" },
  ];

  useEffect(() => {
    let lang;

    switch (prop.i18n.language) {
      case "de":
        lang = languages[0];
        break;
      case "fr":
        lang = languages[1];
        break;
      case "it":
        lang = languages[2];
        break;
      case "en":
        lang = languages[3];
        break;
      default:
        lang = languages[0];
    }
    setSelectedLanguage(lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prop.i18n.language]);

  return (
    <Styled.Container>
      {languages.map((item, key) => (
        <Styled.Keys
          key={key}
          onClick={() => {
            setSelectedLanguage(item);
            if (prop?.ignori18n) {
              prop.handleSelectedLanguage(item.language);
            } else {
              prop.i18n.changeLanguage(item.language);
            }
          }}
          style={{
            color: selectedLanguage?.language === item.language ? "red" : "black",
            textDecoration: selectedLanguage?.language === item.language ? "underline" : "none",
          }}>
          {item.language.toUpperCase()}
        </Styled.Keys>
      ))}
    </Styled.Container>
  );
};

const TranslatedKeys = withTranslation("common")(TranslationKeys);
export default TranslatedKeys;
