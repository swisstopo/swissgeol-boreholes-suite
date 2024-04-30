export interface WorkgroupSelectProps {
  setState: React.Dispatch<React.SetStateAction<EditorSearchState>>;
  state: {
    workgroup: number;
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
    selectedFile: Blob[] | null;
  };
}

export interface ActionsModalProps {
  setState: React.Dispatch<React.SetStateAction<EditorSearchState>>;
  state: {
    creating: boolean;
    selectedLithologyFile: Blob[] | null;
    selectedBoreholeAttachments: Blob[] | null;
    selectedFile: Blob[] | null;
    upload: boolean;
    workgroup: number;
    enabledWorkgroups: Workgroup[];
  };
  refresh: () => void;
}

export interface EditorSearchState {}
