import { Button, List, ListItem, ListItemIcon, ListItemText, Popover } from "@mui/material";
import { theme } from "../../AppTheme.ts";
import { MouseEvent, useEffect, useState } from "react";
import CheckIcon from "@mui/icons-material/Check";
import ArrowDownIcon from "../../../public/icons/arrow_down.svg?react";
import ArrowUpIcon from "../../../public/icons/arrow_up.svg?react";
import i18n from "../../i18n";

const languages = ["de", "fr", "it", "en"];

export function LanguagePopup() {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();
  const isOpen = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  useEffect(() => {
    const handleLanguageChange = () => {
      switch (i18n.language) {
        case "de":
          setSelectedLanguage(languages[0]);
          break;
        case "fr":
          setSelectedLanguage(languages[1]);
          break;
        case "it":
          setSelectedLanguage(languages[2]);
          break;
        case "en":
          setSelectedLanguage(languages[3]);
          break;
        default:
          setSelectedLanguage(languages[0]);
      }
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, []);

  const onLanguageChanged = (language: string) => {
    i18n.changeLanguage(language);
    handleClose();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        endIcon={anchorEl ? <ArrowUpIcon /> : <ArrowDownIcon />}
        sx={{
          width: "67px",
          fontSize: "14px",
          color: theme.palette.primary.main,
          fontWeight: "500",
          ...(isOpen && { backgroundColor: theme.palette.background.lightgrey }),
        }}
        data-cy="language-selector">
        {selectedLanguage.toUpperCase()}
      </Button>
      <Popover
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        sx={{ marginTop: "5px" }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}>
        <List sx={{ padding: 0 }}>
          {languages.map(language => (
            <ListItem
              key={language}
              data-cy={`language-${language}`}
              onClick={() => {
                onLanguageChanged(language);
              }}
              sx={{
                cursor: "pointer",
                "&:hover": { backgroundColor: theme.palette.background.lightgrey },
              }}>
              {selectedLanguage === language && (
                <ListItemIcon sx={{ minWidth: "20px" }}>
                  <CheckIcon fontSize="small" sx={{ mr: 1 }} />
                </ListItemIcon>
              )}
              <ListItemText
                sx={{
                  textAlign: "right",
                  minWidth: "24px",
                  paddingLeft: "5px",
                  fontSize: "14px",
                }}>
                {language.toUpperCase()}
              </ListItemText>
            </ListItem>
          ))}
        </List>
      </Popover>
    </>
  );
}
