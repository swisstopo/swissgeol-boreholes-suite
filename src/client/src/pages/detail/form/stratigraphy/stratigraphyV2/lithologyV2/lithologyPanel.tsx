import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress } from "@mui/material";
import { FullPageCentered } from "../../../../../../components/styledComponents.ts";
import { EditStateContext } from "../../../../editStateContext.tsx";
import { useLithologies } from "../../lithology.ts";

export const LithologyPanel = ({ stratigraphyId }: { stratigraphyId: number }) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(EditStateContext);
  const { data: lithologies, isLoading } = useLithologies(stratigraphyId);

  if (isLoading)
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );

  if (editingEnabled) {
    return <div>edit</div>;
  } else {
    if (!lithologies || lithologies.length === 0) {
      return <Box>{t("msgLithologyEmpty")}</Box>;
    } else {
      return <div>view</div>;
    }
  }
};
