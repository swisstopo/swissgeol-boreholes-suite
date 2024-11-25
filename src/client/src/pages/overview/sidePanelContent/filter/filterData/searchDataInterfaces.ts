export interface AdditionalValues {
  id: number;
  code: string;
  conf: null;
  de: {
    text: string;
    descr: string;
  };
  en: {
    text: string;
    descr: string;
  };
  fr: {
    text: string;
    descr: string;
  };
  it: {
    text: string;
    descr: string;
  };
  level: null;
  path: null;
  translationId: string;
}

export interface SearchData {
  id: number;
  type: string;
  value: string;
  label?: string;
  labels?: string[];
  require?: boolean;
  schema?: string;
  multiple?: boolean;
  search?: boolean;
  isVisible?: boolean;
  hideShowAllFields?: boolean;
  levels?: object;
  isVisibleValue?: string;
  additionalValues?: AdditionalValues[];
  placeholder?: string;
  hasTwoFields?: boolean;
  isNumber?: boolean;
  inputType?: string;
  to?: boolean;
  hasUnknown?: boolean;
}
