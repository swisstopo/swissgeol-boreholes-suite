import React from "react";
import { SxProps } from "@mui/material";
import { Workgroup } from "../../../../api-lib/ReduxStateInterfaces";

export interface ErrorResponse {
  detail: string;
  errors: object;
  message: string;
}

export interface WorkgroupSelectProps {
  workgroupId: number | null;
  enabledWorkgroups: Workgroup[];
  setWorkgroupId: React.Dispatch<React.SetStateAction<number | null>>;
  sx?: SxProps;
}

export interface NewBoreholeProps extends WorkgroupSelectProps {
  toggleDrawer: (open: boolean) => void;
}

export interface ImportContentProps {
  setSelectedBoreholeAttachments: React.Dispatch<React.SetStateAction<Blob[] | null>>;
  selectedFile: Blob[] | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<Blob[] | null>>;
  setSelectedLithologyFile: React.Dispatch<React.SetStateAction<Blob[] | null>>;
}

export interface ImportModalProps extends ImportContentProps {
  modal: boolean;
  creating: boolean;
  selectedLithologyFile: Blob[] | null;
  selectedBoreholeAttachments: Blob[] | null;
  selectedFile: Blob[] | null;
  upload: boolean;
  workgroup: number | null;
  setWorkgroup: React.Dispatch<React.SetStateAction<number | null>>;
  enabledWorkgroups: Workgroup[];
  setCreating: React.Dispatch<React.SetStateAction<boolean>>;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
  setUpload: React.Dispatch<React.SetStateAction<boolean>>;
  setErrorsResponse: React.Dispatch<React.SetStateAction<ErrorResponse | null>>;
  setValidationErrorModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedFile: React.Dispatch<React.SetStateAction<Blob[] | null>>;
  setSelectedLithologyFile: React.Dispatch<React.SetStateAction<Blob[] | null>>;
  refresh: () => void;
}
