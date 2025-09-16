import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress } from "@mui/material";
import { useFaciesDescription, useLithoDescription } from "../../../../../../api/stratigraphy.ts";
import { FullPageCentered } from "../../../../../../components/styledComponents.ts";
import { EditStateContext } from "../../../../editStateContext.tsx";
import { useLithologies } from "../../lithology.ts";
import { LithologyContentEdit } from "./lithologyContentEdit.tsx";

export const LithologyPanel = ({ stratigraphyId }: { stratigraphyId: number }) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(EditStateContext);
  const { data: lithologies, isLoading: isLoadingLithologies } = useLithologies(stratigraphyId);
  const { data: lithologicalDescriptions, isLoading: isLoadingLithologicalDescriptions } =
    useLithoDescription(stratigraphyId);
  const { data: faciesDescriptions, isLoading: isLoadingFaciesDescription } = useFaciesDescription(stratigraphyId);

  // TODO: Remove defaults after migrating backend data
  const lithologyArray = useMemo(() => (lithologies ? lithologies : []), [lithologies]);
  const lithologicalDescriptionsArray = useMemo(
    () => (lithologicalDescriptions ? lithologicalDescriptions : []),
    [lithologicalDescriptions],
  );
  const faciesDescriptionsArray = useMemo(() => (faciesDescriptions ? faciesDescriptions : []), [faciesDescriptions]);

  // Loading state
  if (isLoadingLithologies || isLoadingLithologicalDescriptions || isLoadingFaciesDescription) {
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );
  }

  // Edit mode
  if (editingEnabled) {
    return (
      <LithologyContentEdit
        stratigraphyId={stratigraphyId}
        lithologies={lithologyArray}
        lithologicalDescriptions={lithologicalDescriptionsArray}
        faciesDescriptions={faciesDescriptionsArray}
      />
    );
  }

  // View mode
  if (
    lithologyArray.length === 0 &&
    lithologicalDescriptionsArray.length === 0 &&
    faciesDescriptionsArray.length === 0
  ) {
    return <Box>{t("msgLithologyEmpty")}</Box>;
  } else {
    return <div>view</div>;
  }
};
