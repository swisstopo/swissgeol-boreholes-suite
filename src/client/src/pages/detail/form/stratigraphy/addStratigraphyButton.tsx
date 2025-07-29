import { FC } from "react";
import { useTranslation } from "react-i18next";
import { SxProps } from "@mui/material";
import { Plus } from "lucide-react";
//TODO uncomment when stratigraphy extraction is available
// import ExtractAiIcon from "../../../../assets/icons/extractAi.svg?react";
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
  sx,
}) => {
  const { t } = useTranslation();

  return (
    <ButtonSelect
      fieldName="addStratigraphy"
      variant="contained"
      items={[
        { key: Actions.addEmpty, value: t("addEmptyStratigraphy"), startIcon: <Plus /> },
        //TODO uncomment when stratigraphy extraction is available
        // { key: Actions.extract, value: t("extractStratigraphyFromProfile"), startIcon: <ExtractAiIcon /> },
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
      sx={{ height: "36px", ...sx }}
    />
  );
};
