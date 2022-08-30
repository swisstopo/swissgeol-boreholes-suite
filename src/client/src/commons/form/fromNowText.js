import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import 'moment/locale/en-gb';
import 'moment/locale/it';
import 'moment/locale/fr';
import 'moment/locale/de-ch';
import { withTranslation } from 'react-i18next';

class FromNowText extends React.Component {
  render() {
    const { date, i18n } = this.props;
    if (i18n.language === 'de') {
      moment.locale('de-ch');
    } else if (i18n.language === 'en') {
      moment.locale('en-gb');
    } else {
      moment.locale(i18n.language);
    }
    if (moment(date).isValid()) {
      return moment(date).fromNow();
    }
    return null;
  }
}

FromNowText.propTypes = {
  date: PropTypes.string,
  i18n: PropTypes.object
};

FromNowText.defaultProps = {
  date: null
};

export default withTranslation()(FromNowText);
