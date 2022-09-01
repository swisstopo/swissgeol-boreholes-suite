import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import {
  loadCantons
} from '../../../../lib/index'

import {
  Form,
  Header,
} from 'semantic-ui-react'

class CantonDropdown extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      selected: this.props.selected,
    }
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount(){
    const {
      cantons
    } = this.props
    if(cantons.data.length===0) this.props.loadCantons()
  }

  static getDerivedStateFromProps(nextProps, prevState){
    if (nextProps.selected !== prevState.selected){
      return {selected: nextProps.selected}
    }
    return null
  }

  shouldComponentUpdate(nextProps, nextState){
    if(
      this.props.cantons.data.length !==
      nextProps.cantons.data.length){
      return true
    }else if (this.state.selected !== nextState.selected) {
      return true
    }else if (this.props.selected !== nextProps.selected) {
      return true
    }
    return false
  }

  handleChange(event, data) {
    const {
      onSelected,
      cantons
    } = this.props
    for (var i = 0; i < cantons.data.length; i++) {
      let h = cantons.data[i]
      if(h.id === data.value){
        this.setState({selected: h.id})
        if(onSelected!==undefined){
          onSelected({...h})
        }
        break
      }
    }
  }

  render() {
    const {
      cantons
    } = this.props, {
        selected
    } = this.state
    return (
      <Form.Select
        fluid={true}
        search
        selection
        options={
          cantons.data.map((canton, idx) => (
            {
              key: "mun-opt-" + idx,
              value: canton.id,
              text: canton.name,
              content: <Header
                content={
                  canton.name
                }
                subheader={canton.cname}/>
            }//: null
          ))
        }
        value={selected}
        onChange={this.handleChange}
      />
    );
  }
}

CantonDropdown.propTypes = {
  canton: PropTypes.number,
  selected: PropTypes.number,
  onSelected: PropTypes.func
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
)(CantonDropdown)
