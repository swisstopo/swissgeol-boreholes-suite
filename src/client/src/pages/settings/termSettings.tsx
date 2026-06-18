import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, TextField } from "@mui/material";
import { Trash2, X } from "lucide-react";
import Markdown from "markdown-to-jsx";
import { TermUpdate, useDraftTerms, useTermsMutations } from "../../api/terms.ts";
import TranslationKeys from "../../auth/translationKeys";
import { PromptContext } from "../../components/prompt/promptContext.tsx";

type TermLanguage = "en" | "de" | "fr" | "it" | "ro";

const emptyTexts: Record<TermLanguage, string> = { en: "", de: "", fr: "", it: "", ro: "" };

const TermSettings = () => {
  const { t, i18n } = useTranslation();
  const { showPrompt } = useContext(PromptContext);
  const { data: draftTerm } = useDraftTerms();
  const { saveDraft, publish } = useTermsMutations();

  const [texts, setTexts] = useState<Record<TermLanguage, string>>(emptyTexts);
  const [lang, setLang] = useState<TermLanguage>(i18n.language as TermLanguage);
  const [dirty, setDirty] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  useEffect(() => {
    if (draftTerm && !dirty) {
      setTexts({
        en: draftTerm.textEn ?? "",
        de: draftTerm.textDe ?? "",
        fr: draftTerm.textFr ?? "",
        it: draftTerm.textIt ?? "",
        ro: draftTerm.textRo ?? "",
      });
      setIsDraft(draftTerm.isDraft ?? false);
    }
  }, [draftTerm, dirty]);

  const handleSave = () => {
    const payload: TermUpdate = {
      textEn: texts.en,
      textDe: texts.de,
      textFr: texts.fr,
      textIt: texts.it,
      textRo: texts.ro,
    };
    saveDraft.mutate(payload, {
      onSuccess: () => {
        setDirty(false);
        setIsDraft(true);
      },
    });
  };

  const handlePublish = () => {
    publish.mutate(undefined, {
      onSuccess: () => {
        setDirty(false);
        setIsDraft(false);
      },
    });
  };

  const confirmPublish = () => {
    showPrompt("disclaimer_publish_message", [
      { label: "cancel", icon: <X />, variant: "outlined" },
      { label: "publish", icon: <Trash2 />, variant: "contained", action: handlePublish },
    ]);
  };

  return (
    <div style={{ padding: "2em", flex: 1, display: "flex", flexDirection: "row" }}>
      <div style={{ flex: "1 1 100%", padding: "1em", margin: "1em" }}>
        <div style={{ display: "flex", flexDirection: "row", paddingBottom: "1em" }}>
          <div
            style={{
              color: "rgb(237, 29, 36)",
              fontStyle: "italic",
              textTransform: "capitalize",
              whiteSpace: "nowrap",
            }}>
            {isDraft ? t("draft") : t("terms")}
          </div>
          <div style={{ flex: "1 1 100%", textAlign: "right" }}>
            <Button sx={{ display: isDraft && !dirty ? null : "none" }} variant="contained" onClick={confirmPublish}>
              {t("publish")}
            </Button>
            <Button sx={{ display: dirty ? null : "none" }} variant="contained" disabled={!dirty} onClick={handleSave}>
              {t("save")}
            </Button>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: "10px" }}>
          <TranslationKeys ignori18n handleSelectedLanguage={(language: TermLanguage) => setLang(language)} />
        </div>
        <Box>
          <TextField
            multiline
            rows={20}
            variant="outlined"
            fullWidth
            onChange={e => {
              setTexts(previous => ({ ...previous, [lang]: e.target.value }));
              setDirty(true);
            }}
            value={texts[lang]}
          />
        </Box>
      </div>
      <div style={{ flex: "1 1 100%", padding: "1em", margin: "1em" }}>
        <div style={{ alignItems: "center", display: "flex", flexDirection: "row", paddingBottom: "1em" }}>
          <div style={{ color: "rgb(237, 29, 36)", fontStyle: "italic", textTransform: "capitalize" }}>
            {t("preview")}
          </div>
        </div>
        <Markdown options={{ disableParsingRawHTML: true }}>{texts[lang]}</Markdown>
      </div>
    </div>
  );
};

export default TermSettings;
