import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'

import {
  loadMunicipalities
} from '@ist-supsi/bmsjs'

import {
  Form,
  Header,
} from 'semantic-ui-react'

class MunicipalityDropdown extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      selected: this.props.selected,
    }
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount(){
    const {
      municipalities
    } = this.props
    if(municipalities.data.length===0) this.props.loadMunicipalities()
  }

  static getDerivedStateFromProps(nextProps, prevState){
    if (nextProps.selected !== prevState.selected){
      return {selected: nextProps.selected}
    }
    return null
  }

  shouldComponentUpdate(nextProps, nextState){
    if(
      this.props.municipalities.data.length !==
      nextProps.municipalities.data.length){
      return true
    }else if (!_.isEqual(this.state, nextState)) {
      return true
    }else if (this.props.selected !== nextProps.selected) {
      return true
    }else if (this.props.canton !== nextProps.canton) {
      return true
    }else if (this.props.disabled !== nextProps.disabled) {
      return true
    }
    return false
  }

  handleChange(event, data) {
    const {
      onSelected,
      municipalities
    } = this.props
    for (var i = 0; i < municipalities.data.length; i++) {
      let h = municipalities.data[i]
      if(h.id === data.value){
        this.setState({selected: h.id}, ()=>{
          if(onSelected!==undefined){
            onSelected({...h})
          }
        })
        break
      }
    }
  }

  render() {
    const {
      municipalities,
      canton,
      disabled
    } = this.props, {
        selected
    } = this.state
    const data = _.isNil(canton)?
      municipalities.data:
      municipalities.data.filter(municipality => canton === municipality.cid)
    return (
      <Form.Select
        fluid={true}
        search
        selection
        disabled={disabled}
        options={
          data.map((municipality, idx) => (
            {
              key: "mun-opt-" + idx,
              value: municipality.id,
              text: municipality.name,
              content: <Header
                content={
                  municipality.name
                }
                subheader={municipality.cname}/>
            }//: null
          ))
        }
        value={selected}
        onChange={this.handleChange}/>
    )
  }
}

MunicipalityDropdown.propTypes = {
  canton: PropTypes.number,
  selected: PropTypes.number,
  onSelected: PropTypes.func,
  disabled: PropTypes.bool
}

MunicipalityDropdown.defaultProps = {
  canton: null,
  selected: null,
  disabled: false
}

const mapStateToProps = (state, ownProps) => {
  return {
    municipalities: state.core_municipality_list
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch: dispatch,
    loadMunicipalities: () => {
      dispatch(loadMunicipalities())
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MunicipalityDropdown)
