import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress } from "@mui/material";
import { FullPageCentered } from "../../../../../../components/styledComponents.ts";
import { EditStateContext } from "../../../../editStateContext.tsx";
import { useFaciesDescriptions } from "../../faciesDescription.ts";
import { useLithologicalDescriptions } from "../../lithologicalDescription.ts";
import { useLithologies } from "../../lithology.ts";
import { LithologyContentEdit } from "./lithologyContentEdit.tsx";
import { TempLithologyView } from "./tempLithologyView.tsx";

export const LithologyPanel = ({ stratigraphyId }: { stratigraphyId: number }) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(EditStateContext);
  const { data: lithologies, isLoading: isLoadingLithologies } = useLithologies(stratigraphyId);
  const { data: lithologicalDescriptions, isLoading: isLoadingLithologicalDescriptions } =
    useLithologicalDescriptions(stratigraphyId);
  const { data: faciesDescriptions, isLoading: isLoadingFaciesDescription } = useFaciesDescriptions(stratigraphyId);

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
    return (
      <TempLithologyView
        lithologies={lithologies}
        lithologicalDescriptions={lithologicalDescriptions}
        faciesDescriptions={faciesDescriptions}
      />
    );
  }
};
