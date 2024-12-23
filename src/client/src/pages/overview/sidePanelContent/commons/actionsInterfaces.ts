import React from "react";
import { SxProps } from "@mui/material";
import { Workgroup } from "../../../../api-lib/ReduxStateInterfaces";

export interface ErrorResponse {
  detail: string;
  errors: object;
  message: string;
}

export interface WorkgroupSelectProps {
  workgroupId: string;
  enabledWorkgroups: Workgroup[];
  setWorkgroupId: React.Dispatch<React.SetStateAction<string>>;
  hideLabel?: boolean;
  sx?: SxProps;
}

export interface NewBoreholeProps extends WorkgroupSelectProps {
  toggleDrawer: (open: boolean) => void;
}

export interface ImportModalProps {
  modal: boolean;
  creating: boolean;
  selectedFile: Blob[] | null;
  upload: boolean;
  workgroup: string;
  setWorkgroup: React.Dispatch<React.SetStateAction<string>>;
  enabledWorkgroups: Workgroup[];
  setCreating: React.Dispatch<React.SetStateAction<boolean>>;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
  setUpload: React.Dispatch<React.SetStateAction<boolean>>;
  setErrorsResponse: React.Dispatch<React.SetStateAction<ErrorResponse | null>>;
  setValidationErrorModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedFile: React.Dispatch<React.SetStateAction<Blob[] | null>>;
  refresh: () => void;
}
