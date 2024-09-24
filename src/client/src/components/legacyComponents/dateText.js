import React from "react";
import { withTranslation } from "react-i18next";
import moment from "moment";
import PropTypes from "prop-types";

import "moment/locale/en-gb";
import "moment/locale/it";
import "moment/locale/fr";
import "moment/locale/de-ch";

const getFromNow = props => {
  const { date, i18n } = props;
  if (i18n.language === "de") {
    moment.locale("de-ch");
  } else if (i18n.language === "en") {
    moment.locale("en-gb");
  } else {
    moment.locale(i18n.language);
  }
  if (moment(date).isValid()) {
    return moment(date).fromNow();
  } else if (date === null) {
    return props.nullValue;
  }
};

class DateText extends React.Component {
  constructor(props) {
    super(props);
    this.countdown = this.countdown.bind(this);

    this.state = {
      fromnow: props.fromnow === true ? getFromNow(props) : "",
      intervalId: null,
    };

    if (props.fromnow === true) {
      this.state.intervalId = window.setInterval(this.countdown, this.props.timer * 1000);
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const fromnow = getFromNow(nextProps);
    if (fromnow !== prevState.fromnow) {
      return {
        ...prevState,
        fromnow: fromnow,
      };
    }
    return null;
  }

  componentDidMount() {
    if (this.props.fromnow === true) {
      this.countdown();
    }
  }

  componentWillUnmount() {
    if (this.state.intervalId !== null) {
      window.clearInterval(this.state.intervalId);
    }
  }

  countdown() {
    this.setState(
      {
        fromnow: getFromNow(this.props),
      },
      () => {
        if (this.props.onTick !== undefined) {
          this.props.onTick(this.props.date, moment(this.props.date));
        }
      },
    );
  }

  render() {
    const { date, i18n, hours, fromnow } = this.props;
    if (moment(date).isValid()) {
      if (fromnow === true) {
        return this.state.fromnow;
      }
      if (i18n.language === "de") {
        moment.locale("de-ch");
      } else if (i18n.language === "en") {
        moment.locale("en-gb");
      } else {
        moment.locale(i18n.language);
      }
      return moment(date).format("DD.MM.YYYY" + (hours ? " HH:mm" : ""));
    } else if (date === null) {
      return this.props.nullValue;
    }
    return null;
  }
}

DateText.propTypes = {
  date: PropTypes.string,
  fromnow: PropTypes.bool,
  hours: PropTypes.bool,
  i18n: PropTypes.shape({
    locale: PropTypes.func,
  }),
  nullValue: PropTypes.string,
  onTick: PropTypes.func,
  timer: PropTypes.number,
};

DateText.defaultProps = {
  date: null,
  hours: false,
  fromnow: false,
  nullValue: "",
  timer: 60, // seconds
};

export default withTranslation()(DateText);
