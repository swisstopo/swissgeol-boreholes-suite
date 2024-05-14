import React from "react";

export interface WorkgroupSelectProps {
  workgroup: number;
  enabledWorkgroups: Workgroup[];
  setWorkgroup: React.Dispatch<React.SetStateAction<number>>;
}

export interface Workgroup {
  id: number;
  workgroup: string;
  roles: string[];
}

export interface ImportModalProps {
  setSelectedBoreholeAttachments: React.Dispatch<React.SetStateAction<Blob>>;
  selectedFile: Blob[] | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<Blob>>;
  setSelectedLithologyFile: React.Dispatch<React.SetStateAction<Blob>>;
}

export interface ActionsModalProps extends ImportModalProps {
  modal: boolean;
  creating: boolean;
  selectedLithologyFile: Blob[] | null;
  selectedBoreholeAttachments: Blob[] | null;
  selectedFile: Blob[] | null;
  upload: boolean;
  workgroup: number;
  enabledWorkgroups: Workgroup[];
  setCreating: React.Dispatch<React.SetStateAction<boolean>>;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
  setUpload: React.Dispatch<React.SetStateAction<boolean>>;
  setErrorsResponse: React.Dispatch<React.SetStateAction<string>>;
  setValidationErrorModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedFile: React.Dispatch<React.SetStateAction<Blob>>;
  setWorkgroup: React.Dispatch<React.SetStateAction<number>>;
  setSelectedLithologyFile: React.Dispatch<React.SetStateAction<Blob>>;
  refresh: () => void;
}
