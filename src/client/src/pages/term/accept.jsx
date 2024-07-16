import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { acceptTerms, getTerms } from "../../api-lib/index";
import { BdmsDialog } from "../../components/dialog/bdmsDialog.tsx";
import TranslationKeys from "../../commons/translationKeys";

class AcceptTerms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFetching: true,
      hasAccepted: false,
      id: null,
      en: "",
      de: "",
      fr: "",
      it: "",
      ro: "",
    };
  }

  componentDidMount() {
    getTerms().then(r => {
      this.setState({
        isFetching: false,
        id: r.data.data.id,
        en: r.data.data.en,
        fr: r.data.data.fr,
        de: r.data.data.de,
        it: r.data.data.it,
        ro: r.data.data.ro,
      });
    });
  }

  render() {
    return this.state.hasAccepted ? (
      this.props.children
    ) : (
      <BdmsDialog
        title={this.props.t("terms")}
        headerContent={<TranslationKeys />}
        width={500}
        height={450}
        markdownContent={this.state[this.props.i18n.language]}
        closeOnBackdropClick={false}
        onCloseCallback={() => {
          this.props.acceptTerms(this.state.id);
          this.setState({ hasAccepted: true });
        }}></BdmsDialog>
    );
  }
}

AcceptTerms.propTypes = {
  acceptTerms: PropTypes.func,
  t: PropTypes.func,
};

const mapStateToProps = state => {
  return {
    user: state.core_user,
    loader: state.dataLoaderState,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    acceptTerms: async id => {
      return dispatch(acceptTerms(id));
    },
  };
};

const ConnectedAcceptTerms = connect(mapStateToProps, mapDispatchToProps)(withTranslation("common")(AcceptTerms));
export default ConnectedAcceptTerms;
