import { NumericFormat } from "react-number-format";
import TranslationText from "../../../form/translationText";
import { Icon } from "semantic-ui-react";
import { BoreholeNumbersPreviewProps } from "./menuComponentInterfaces";

export const BoreholeNumbersPreview: React.FC<BoreholeNumbersPreviewProps> = ({ boreholes }) => {
  return (
    <>
      <TranslationText firstUpperCase id="boreholes" />:{" "}
      {boreholes.isFetching ? (
        <Icon loading name="spinner" />
      ) : (
        <NumericFormat value={boreholes.dlen} thousandSeparator="'" displayType="text" />
      )}
    </>
  );
};
