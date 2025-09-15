import { FC } from "react";
import { useTranslation } from "react-i18next";
import { SxProps } from "@mui/material";
import { Sparkles } from "lucide-react";
import { ButtonSelect } from "../../../../components/buttons/buttonSelect";

interface AddStratigraphyButtonProps {
  addEmptyStratigraphy: () => void;
  extractStratigraphyFromProfile: () => void;
  sx?: SxProps;
}

enum Actions {
  addEmpty = "addEmpty",
  extract = "extract",
}

export const AddStratigraphyButton: FC<AddStratigraphyButtonProps> = ({
  addEmptyStratigraphy,
  extractStratigraphyFromProfile,
}) => {
  const { t } = useTranslation();

  return (
    <ButtonSelect
      fieldName="addStratigraphy"
      variant="contained"
      items={[
        { key: Actions.addEmpty, value: t("addEmptyStratigraphy") },
        { key: Actions.extract, value: t("extractStratigraphyFromProfile"), startIcon: <Sparkles /> },
      ]}
      selectedItem={{ key: "new", value: t("newStratigraphy") }}
      onItemSelected={item => {
        switch (item.key) {
          case Actions.addEmpty:
            addEmptyStratigraphy();
            break;
          case Actions.extract:
            extractStratigraphyFromProfile();
            break;
        }
      }}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{ height: "36px" }}
    />
  );
};
