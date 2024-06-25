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
        <NumericFormat
          data-cy="boreholes-number-preview"
          value={boreholes.length}
          thousandSeparator="'"
          displayType="text"
          style={{ marginLeft: 1 }}
        />
      )}
    </>
  );
};
