import { FC } from "react";
import { useTranslation } from "react-i18next";
import { ButtonSelect } from "../../../../components/buttons/buttonSelect";

interface AddStratigraphyButtonProps {
  addEmptyStratigraphy: () => void;
  extractStratigraphyFromProfile: () => void;
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
        // extract from profile is not implemented yet
        // { key: Actions.extract, value: t("extractStratigraphyFromProfile"), startIcon: <Sparkles /> },
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
      sx={{ position: "absolute", top: 0, right: 0, mx: 2, my: 1 }}
    />
  );
};
