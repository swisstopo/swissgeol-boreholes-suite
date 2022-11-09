import React from "react";
import { Dropdown } from "semantic-ui-react";
import { useTranslation } from "react-i18next";

const CasingList = props => {
  const { dropDownValue, handleCasing, ItemValue, data, disabled } = props;
  const { t } = useTranslation();

  // add reset option to dropdown
  if (!data.some(d => d.key === 0)) {
    data.unshift({
      key: 0,
      value: null,
      text: (
        <span
          style={{
            color: "red",
          }}>
          {t("common:reset")}
        </span>
      ),
    });
  }
  return (
    <div>
      <Dropdown
        fluid
        disabled={disabled}
        onChange={(e, data) => {
          handleCasing(ItemValue, data.value);
        }}
        options={data}
        selection
        value={dropDownValue}
      />
    </div>
  );
};

export default CasingList;
