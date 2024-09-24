import React from "react";
import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import { withTranslation } from "react-i18next";
import { Input } from "semantic-ui-react";
import { de, enGB, fr, it } from "date-fns/esm/locale";
import moment from "moment";
import PropTypes from "prop-types";

import "react-datepicker/dist/react-datepicker.css";
import "./dateField.css";

registerLocale("en", enGB);
registerLocale("fr", fr);
registerLocale("it", it);
registerLocale("de", de);
setDefaultLocale("en");

class DateField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: this.props.date,
    };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.date !== prevState.date) {
      return {
        date: nextProps.date,
      };
    } else {
      return null;
    }
  }
  render() {
    const { i18n, onChange, placeholder, isEditable } = this.props;

    let locale = i18n.language;

    return (
      <DatePicker
        customInput={
          <div>
            <Input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              icon="calendar alternate outline"
              iconPosition="left"
              placeholder={placeholder}
              spellCheck="false"
              data-cy="datepicker"
              className="datepicker-input"
              value={moment(this.state.date).isValid() ? moment(this.state.date).format("DD.MM.YYYY") : ""}
              disabled={true}
              readOnly={!isEditable}
            />
          </div>
        }
        dateFormat="dd.MM.yyyy"
        dropdownMode="select"
        locale={locale}
        onChange={date => {
          if (onChange !== undefined) {
            onChange(date ? moment(date).format("YYYY-MM-DD") : "");
          }
        }}
        selected={moment(this.state.date).isValid() ? moment(this.state.date).toDate() : null}
        showMonthDropdown
        showYearDropdown
        style={{
          width: "100%",
          backgroundColor: "blue",
        }}
        disabled={!isEditable}
      />
    );
  }
}

DateField.propTypes = {
  date: PropTypes.string,
  i18n: PropTypes.shape({
    language: PropTypes.string,
  }),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
};

DateField.defaultProps = {
  placeholder: null,
  isEditable: true,
};

const TranslatedDateField = withTranslation()(DateField);

export default TranslatedDateField;
