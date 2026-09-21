import { SxProps } from "@mui/material";

/**
 * An error body from the import endpoints. They answer with a validation problem carrying per-field
 * errors, with a translated user error, or with a plain problem document, so each response carries
 * only a subset of these and every reader has to check.
 */
export interface ErrorResponse {
  detail?: string;
  // Keyed by the field that failed, as ValidationProblemDetails reports it.
  errors?: Record<string, string[]>;
  message?: string;
  messageKey?: string;
}

export interface WorkgroupSelectProps {
  sx?: SxProps;
}

export interface NewBoreholeProps extends WorkgroupSelectProps {
  toggleDrawer: (open: boolean) => void;
}
