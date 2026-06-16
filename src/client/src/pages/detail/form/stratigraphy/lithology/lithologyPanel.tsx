import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress } from "@mui/material";
import { FullPageCentered } from "../../../../../components/styledComponents.ts";
import { EditStateContext } from "../../../editStateContext.tsx";
import { useLithologyTabContents } from "../stratigraphy.ts";
import { LithologyPanelEdit } from "./lithologyPanelEdit.tsx";
import { LithologyPanelReadOnly } from "./lithologyPanelReadOnly.tsx";

export const LithologyPanel = ({ stratigraphyId }: { stratigraphyId: number }) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(EditStateContext);
  const { data: tabContents, isLoading } = useLithologyTabContents(stratigraphyId);

  if (isLoading) {
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );
  }

  if (!tabContents) return null;

  const { lithologies, lithologicalDescriptions, faciesDescriptions } = tabContents;

  if (editingEnabled) {
    return (
      <LithologyPanelEdit
        stratigraphyId={stratigraphyId}
        lithologies={lithologies}
        lithologicalDescriptions={lithologicalDescriptions}
        faciesDescriptions={faciesDescriptions}
      />
    );
  }

  if (lithologies.length === 0 && lithologicalDescriptions.length === 0 && faciesDescriptions.length === 0) {
    return <Box>{t("msgLithologyEmpty")}</Box>;
  }
  return (
    <LithologyPanelReadOnly
      stratigraphyId={stratigraphyId}
      lithologies={lithologies}
      lithologicalDescriptions={lithologicalDescriptions}
      faciesDescriptions={faciesDescriptions}
    />
  );
};
