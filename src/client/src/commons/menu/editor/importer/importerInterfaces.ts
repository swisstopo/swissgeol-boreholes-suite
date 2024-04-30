export interface WorkgroupSelectProps {
  setState: React.Dispatch<React.SetStateAction<EditorSearchState>>;
  state: {
    workgroup: Workgroup;
    enabledWorkgroups: Workgroup[];
  };
}

export interface Workgroup {
  id: number;
  workgroup: string;
  roles: string[];
}

export interface ImportModalProps {
  setState: React.Dispatch<React.SetStateAction<EditorSearchState>>;
  state: {
    creating: boolean;
    selectedLithologyFile: Blob[] | null;
    selectedBoreholeAttachments: Blob[] | null;
    selectedFile: Blob[] | null;
    upload: boolean;
    workgroup: Workgroup;
    enabledWorkgroups: Workgroup[];
  };
  refresh: () => void;
}

export interface EditorSearchState {}
