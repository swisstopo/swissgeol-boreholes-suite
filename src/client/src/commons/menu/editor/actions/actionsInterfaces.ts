import React from "react";
import { ErrorResponse } from "../menuComponents/menuComponentInterfaces";
import { Workgroup } from "../../../../ReduxStateInterfaces";

export interface WorkgroupSelectProps {
  workgroup: number | null;
  enabledWorkgroups: Workgroup[];
  setWorkgroup: React.Dispatch<React.SetStateAction<number | null>>;
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
