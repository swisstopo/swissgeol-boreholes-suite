import { FC, MouseEvent } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Dialog, DialogProps, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { Sparkle } from "lucide-react";
import { Stratigraphy } from "../../../../../../api/stratigraphy.ts";
import { BoreholesCard } from "../../../../../../components/boreholesCard.tsx";
import { BoreholesButton } from "../../../../../../components/buttons/buttons.tsx";
import { FormContainer, FormInput } from "../../../../../../components/form/form.ts";
import { useFormDirtyChanges } from "../../../../../../components/form/useFormDirtyChanges.tsx";
import {
  DialogFooterContainer,
  DialogHeaderContainer,
  DialogMainContent,
} from "../../../../../../components/styledComponents.ts";
import { Lithology } from "../../lithology.ts";
import { LithologyConsolidatedForm } from "./lithologyConsolidatedForm.tsx";
import { LithologyUnconsolidatedForm } from "./lithologyUnconsolidatedForm.tsx";

interface LithologyEditModalProps {
  lithology: Lithology | undefined;
  updateLithology: (lithology: Lithology) => void;
}

export const LithologyEditModal: FC<LithologyEditModalProps> = ({ lithology, updateLithology }) => {
  const { t } = useTranslation();
  const formMethods = useForm<Stratigraphy>({ mode: "all" });
  const { formState, getValues } = formMethods;
  useFormDirtyChanges({ formState });

  const closeDialog = () => {
    const values = getValues();
    updateLithology({ ...lithology, ...values } as Lithology);
  };

  const handleClose: DialogProps["onClose"] = () => {
    closeDialog();
  };

  return (
    <Dialog open={lithology !== undefined} onClose={handleClose} fullScreen>
      <DialogHeaderContainer>
        <Stack direction="row">
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            {t("lithology")}
          </Typography>
        </Stack>
      </DialogHeaderContainer>
      <DialogMainContent sx={{ padding: "0 60px", display: "flex", justifyContent: "center" }}>
        <FormProvider {...formMethods}>
          <Stack gap={3} flex={"0 1 1040px"} m={7.5}>
            <BoreholesCard
              data-cy="lithology-basic-data"
              title={t("basicData")}
              action={
                <ToggleButtonGroup
                  value={lithology?.isUnconsolidated}
                  onChange={(event: MouseEvent<HTMLElement>, isUnconsolidated: boolean) => {
                    // TODO: Set in form state
                    console.log("isUnconsolidated", isUnconsolidated);
                  }}
                  exclusive>
                  <ToggleButton value={true}>
                    <Typography>{t("unconsolidated")}</Typography>
                  </ToggleButton>
                  <ToggleButton value={false}>
                    <Typography>{t("consolidated")}</Typography>
                  </ToggleButton>
                </ToggleButtonGroup>
              }>
              <FormContainer direction={"row"}>
                <FormInput fieldName={"fromDepth"} label={"fromdepth"} value={lithology?.fromDepth} required={true} />
                <FormInput fieldName={"toDepth"} label={"todepth"} value={lithology?.toDepth} required={true} />
              </FormContainer>
            </BoreholesCard>
            <BoreholesCard
              data-cy="lithology-lithological-description"
              title={t("lithologyLayerDescription")}
              action={
                <BoreholesButton
                  label="lithologyAnalysis"
                  variant="contained"
                  disabled
                  icon={<Sparkle />}
                  onClick={() => {
                    console.log("analyze lithological layer description");
                  }}
                />
              }>
              <FormContainer>
                <FormInput fieldName={"description"} label={"description"} value={""} multiline={true} rows={3} />
              </FormContainer>
            </BoreholesCard>
            {lithology?.isUnconsolidated ? (
              <LithologyUnconsolidatedForm lithology={lithology} />
            ) : (
              <LithologyConsolidatedForm lithology={lithology} />
            )}
            <BoreholesCard data-cy="lithology-notes" title={t("remarks")}>
              <FormContainer>
                <FormInput fieldName={"notes"} label={"remarks"} value={lithology?.notes} multiline={true} rows={3} />
              </FormContainer>
            </BoreholesCard>
          </Stack>
        </FormProvider>
      </DialogMainContent>
      <DialogFooterContainer>
        <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={0.75}>
          <BoreholesButton variant="contained" color="primary" label={t("close")} onClick={closeDialog} />
        </Stack>
      </DialogFooterContainer>
    </Dialog>
  );
};
