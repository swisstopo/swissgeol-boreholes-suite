import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress } from "@mui/material";
import { useFaciesDescription, useLithologicalDescription } from "../../../../../../api/stratigraphy.ts";
import { FullPageCentered } from "../../../../../../components/styledComponents.ts";
import { EditStateContext } from "../../../../editStateContext.tsx";
import { useLithologies } from "../../lithology.ts";
import { LithologyContentEdit } from "./lithologyContentEdit.tsx";

export const LithologyPanel = ({ stratigraphyId }: { stratigraphyId: number }) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(EditStateContext);
  const { data: lithologies, isLoading: isLoadingLithologies } = useLithologies(stratigraphyId);
  const { data: lithologicalDescriptions, isLoading: isLoadingLithologicalDescriptions } = useLithologicalDescription(
    stratigraphyId - 15000000,
  ); // TODO: Remove "- 15000000" workaround after migrating backend data
  const { data: faciesDescriptions, isLoading: isLoadingFaciesDescription } = useFaciesDescription(
    stratigraphyId - 15000000,
  ); // TODO: Remove "- 15000000" workaround after migrating backend data

  // Loading state
  if (isLoadingLithologies || isLoadingLithologicalDescriptions || isLoadingFaciesDescription) {
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );
  }

  if (!lithologies || !lithologicalDescriptions || !faciesDescriptions) return null;

  // Edit mode
  if (editingEnabled) {
    return (
      <LithologyContentEdit
        stratigraphyId={stratigraphyId}
        lithologies={lithologies}
        lithologicalDescriptions={lithologicalDescriptions}
        faciesDescriptions={faciesDescriptions}
      />
    );
  }

  // View mode
  if (lithologies.length === 0 && lithologicalDescriptions.length === 0 && faciesDescriptions.length === 0) {
    return <Box>{t("msgLithologyEmpty")}</Box>;
  } else {
    return <div>view</div>;
  }
};
