import React from "react";
import { Dropdown } from "semantic-ui-react";

const CasingList = props => {
  const { dropDownValue, handleCasing, ItemValue, data } = props;

  return (
    <div>
      <Dropdown
        fluid
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
