import { FC, MouseEvent, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Dialog, DialogProps, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
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
  const { formState, getValues, setValue } = formMethods;
  useFormDirtyChanges({ formState });

  useEffect(() => {
    if (lithology) {
      formMethods.reset(lithology);
    }
  }, [lithology, formMethods]);

  useEffect(() => {
    const subscription = formMethods.watch(values => {
      console.log("Form changed:", values);
    });
    return () => subscription.unsubscribe();
  }, [formMethods]);

  const isUnconsolidated = formMethods.watch("isUnconsolidated");

  const closeDialog = () => {
    const values = getValues();
    console.log("values", values);
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
                  value={isUnconsolidated}
                  onChange={(event: MouseEvent<HTMLElement>, isUnconsolidated: boolean) => {
                    setValue("isUnconsolidated", isUnconsolidated);
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
                <FormInput fieldName={"fromDepth"} label={"fromdepth"} required={true} />
                <FormInput fieldName={"toDepth"} label={"todepth"} required={true} />
              </FormContainer>
            </BoreholesCard>
            <BoreholesCard data-cy="lithology-lithological-description" title={t("lithologyLayerDescription")}>
              <FormContainer>
                <FormInput
                  fieldName={"description"}
                  label={"description"}
                  value={""}
                  multiline={true}
                  rows={3}
                  readonly={true}
                />
              </FormContainer>
            </BoreholesCard>
            {lithology &&
              (isUnconsolidated ? (
                <LithologyUnconsolidatedForm lithologyId={lithology.id} formMethods={formMethods} />
              ) : (
                <LithologyConsolidatedForm lithologyId={lithology.id} formMethods={formMethods} />
              ))}
            <BoreholesCard data-cy="lithology-notes" title={t("remarks")}>
              <FormContainer>
                <FormInput fieldName={"notes"} label={"remarks"} multiline={true} rows={3} />
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
