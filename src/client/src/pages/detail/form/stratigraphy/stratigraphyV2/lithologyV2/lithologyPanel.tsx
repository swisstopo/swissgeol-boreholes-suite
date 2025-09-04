import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress } from "@mui/material";
import { FullPageCentered } from "../../../../../../components/styledComponents.ts";
import { EditStateContext } from "../../../../editStateContext.tsx";
import { useLithologies } from "../../lithology.ts";
import { LithologyContentEdit } from "./lithologyContentEdit.tsx";

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
    return <LithologyContentEdit lithologies={lithologies} />;
  } else {
    if (!lithologies || lithologies.length === 0) {
      return <Box>{t("msgLithologyEmpty")}</Box>;
    } else {
      return <div>view</div>;
    }
  }
};
