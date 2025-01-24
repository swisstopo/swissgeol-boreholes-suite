export interface DataCardsProps {
  parentId: string | number;
  getData: (parentId: string | number) => Promise<any>; // Specify the return type more specifically if known
  cyLabel: string;
  addLabel: string;
  emptyLabel: string;
  renderInput: (props: DataCardProps) => JSX.Element;
  renderDisplay: (props: DataCardProps) => JSX.Element;
  sortDisplayed: (a: any, b: any) => number;
}

export interface DataCardProps {
  parentId: number;
  item: any;
}
