import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Stack, TextField, Typography } from "@mui/material";
import { Trash2, X } from "lucide-react";
import Markdown from "markdown-to-jsx";
import { TermUpdate, useDraftTerms, useTermsMutations } from "../../api/terms.ts";
import { theme } from "../../AppTheme.ts";
import { BoreholesButton, SaveButton } from "../../components/buttons/buttons.tsx";
import { PromptContext } from "../../components/prompt/promptContext.tsx";

type TermLanguage = "en" | "de" | "fr" | "it" | "ro";

const emptyTexts: Record<TermLanguage, string> = { en: "", de: "", fr: "", it: "", ro: "" };

const editorLanguages: TermLanguage[] = ["de", "fr", "it", "en"];

const headingSx = {
  color: theme.palette.error.light,
  fontStyle: "italic",
  textTransform: "capitalize",
  whiteSpace: "nowrap",
} as const;

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
    showPrompt("disclaimerPublishMessage", [
      { label: "cancel", icon: <X />, variant: "outlined" },
      { label: "publish", icon: <Trash2 />, variant: "contained", action: handlePublish },
    ]);
  };

  return (
    <Stack direction="row" sx={{ flex: 1, p: 4 }}>
      <Box sx={{ flex: "1 1 100%", p: 2, m: 2 }}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", pb: 2 }}>
          <Typography sx={headingSx}>{isDraft ? t("draft") : t("terms")}</Typography>
          <Stack direction="row" spacing={1}>
            {isDraft && !dirty && <BoreholesButton variant="contained" label="publish" onClick={confirmPublish} />}
            {dirty && <SaveButton variant="contained" onClick={handleSave} />}
          </Stack>
        </Stack>

        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end", pb: 1 }}>
          {editorLanguages.map(language => (
            <Typography
              key={language}
              component="span"
              onClick={() => setLang(language)}
              sx={{
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 100,
                p: "0.2em",
                color: lang === language ? "red" : "black",
                textDecoration: lang === language ? "underline" : "none",
              }}>
              {language.toUpperCase()}
            </Typography>
          ))}
        </Stack>
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
      <Box sx={{ flex: "1 1 100%", p: 2, m: 2 }}>
        <Typography sx={[headingSx, { pb: 2 }]}>{t("preview")}</Typography>
        <Markdown options={{ disableParsingRawHTML: true }}>{texts[lang]}</Markdown>
      </Box>
    </Stack>
  );
};

export default TermSettings;
