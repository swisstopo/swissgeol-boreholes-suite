import { NumericFormat } from "react-number-format";
import TranslationText from "../../../form/translationText";
import { Icon } from "semantic-ui-react";
import { BoreholeNumbersPreviewProps } from "./menuComponentInterfaces";

export const BoreholeNumbersPreview: React.FC<BoreholeNumbersPreviewProps> = ({ boreholes }) => {
  return (
    <div
      key="sb-em-1"
      style={{
        color: boreholes.isFetching === false && boreholes.dlen === 0 ? "red" : "#767676",
        borderBottom: "thin solid rgb(187, 187, 187)",
        padding: "1em 1em 0px 1em",
      }}>
      <TranslationText firstUpperCase id="boreholes" />:{" "}
      {boreholes.isFetching ? (
        <Icon loading name="spinner" />
      ) : (
        <NumericFormat value={boreholes.dlen} thousandSeparator="'" displayType="text" />
      )}
    </div>
  );
};
