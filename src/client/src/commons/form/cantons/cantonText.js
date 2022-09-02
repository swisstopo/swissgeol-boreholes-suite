import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'

import {
  loadCantons
} from '../../../api-lib/index'

class CantonText extends React.Component {
  componentDidMount(){
    const {
      cantons
    } = this.props
    if(cantons.data.length===0) this.props.loadCantons()
  }
  render() {
    const { cantons, id } = this.props
    const m = cantons.data.find(function(element) {
      return element.id === id
    })
    if(id === null || _.isUndefined(m)) return null
    return m.name
  }
}

CantonText.propTypes = {
  id: PropTypes.number
}

const mapStateToProps = (state, ownProps) => {
  return {
    cantons: state.core_canton_list
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch: dispatch,
    loadCantons: () => {
      dispatch(loadCantons())
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CantonText)
