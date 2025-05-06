import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Stack,
  Step,
  StepConnector,
  stepConnectorClasses,
  StepLabel,
  Stepper,
  styled,
  Typography,
} from "@mui/material";
import type { StepIconProps } from "@mui/material/StepIcon";
import { ChevronRight } from "lucide-react";
import { theme } from "../../../../AppTheme.ts";
import { WorkflowCard } from "./styledWorkflowComponents.tsx";
import { useWorkflow, WorkflowStatus } from "./workflow.ts";

const steps = Object.values(WorkflowStatus).slice(0, -1);

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  marginLeft: theme.spacing(3.5),
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.action.disabled,
    borderLeftWidth: "1px",
    minHeight: theme.spacing(1.5),
  },
}));

const StepIcon = ({ active, icon }: StepIconProps) => {
  return (
    <Stack
      sx={{
        height: "36px",
        width: "36px",
        backgroundColor: active ? "white" : "transparent",
        color: active ? theme.palette.primary.main : theme.palette.action.disabled,
        mr: 1.5,
        borderRadius: "50%",
        border: `1px solid ${active ? theme.palette.primary.main : theme.palette.action.disabled}`,
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
      }}>
      {icon}
    </Stack>
  );
};

export const WorkflowStatusCard = () => {
  const { t } = useTranslation();
  const { id: boreholeId } = useParams<{ id: string }>();
  const { data: workflow } = useWorkflow(parseInt(boreholeId));
  const activeStep = steps.findIndex(step => step === workflow?.status);

  return (
    <WorkflowCard>
      <Stack gap={1.5} data-cy={"workflow-status-card"}>
        <Typography variant="h5">{t("status")}</Typography>
        <Stepper activeStep={activeStep} orientation="vertical" connector={<CustomConnector />}>
          {steps.map((label, index) => {
            const isActive = index === activeStep;
            return (
              <Step key={label}>
                <Box
                  sx={{
                    px: 1.5,
                    py: isActive ? 0.5 : 0,
                    mb: isActive ? 1 : 0,
                    borderRadius: 0.5,
                    backgroundColor: isActive ? theme.palette.background.grey : "transparent",
                    border: `1px solid ${isActive ? theme.palette.border.light : "transparent"}`,
                  }}>
                  <StepLabel slots={{ stepIcon: StepIcon }}>
                    <Typography
                      variant={isActive ? "h5" : "body1"}
                      color={isActive ? theme.palette.primary.main : theme.palette.action.disabled}>
                      {t(`statuses.${label}`)}
                    </Typography>
                  </StepLabel>
                </Box>
              </Step>
            );
          })}
        </Stepper>
        <Button
          variant="contained"
          data-cy={"request-review-button"}
          endIcon={<ChevronRight />}
          onClick={() => {
            //Todo: implement request review functionality
          }}>
          {t("requestReview")}
        </Button>
      </Stack>
    </WorkflowCard>
  );
};
