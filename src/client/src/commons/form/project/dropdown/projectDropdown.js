import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'

import {
  loadProjects
} from '../../lib/index'

import {
  Form,
  Header,
} from 'semantic-ui-react'

class ProjectDropdown extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selected: this.props.selected
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    const {
      projects
    } = this.props;
    if (
      projects.data.length === 0
      && projects.isFetching === false
    ) {
      this.props.loadProjects()
    };
  }

  // shouldComponentUpdate(nextProps, nextState){
  //   if (this.props.selected !== nextProps.selected) {
  //     return true
  //   }
  //   return false
  // }

  static getDerivedStateFromProps(nextProps, prevState) {
    const state = { ...prevState }
    if (_.isNil(nextProps.selected)) {
      if (nextProps.multiple === true) {
        state.selected = []
      } else {
        state.selected = null
      }
    } else {
      state.selected = nextProps.selected
    }
    if (_.isEqual(state, prevState)) return null
    return state
  }

  handleChange(event, data) {
    const {
      onSelected,
      projects,
      multiple
    } = this.props
    if (multiple === true) {
      const selection = []
      for (let i = 0; i < projects.data.length; i++) {
        let h = projects.data[i]
        for (var f = 0; f < data.value.length; f++) {
          const s = data.value[f]
          if (h.id === s) {
            selection.push({ ...h })
          }
        }
      }
      this.setState({ selected: data.value })
      if (onSelected !== undefined) {
        onSelected(selection)
      }
    } else {
      for (let i = 0; i < projects.data.length; i++) {
        let h = projects.data[i]
        if (h.id === data.value) {
          this.setState({ selected: h.id })
          if (onSelected !== undefined) {
            onSelected({ ...h })
          }
          break
        }
      }
    }
  }

  render() {
    const {
      projects,
      search,
      multiple
    } = this.props, {
      selected
    } = this.state
    if (projects.isFetching === true) {
      return 'loading projects'
    }
    return (
      <Form.Select
        fluid={true}
        search={search}
        multiple={multiple}
        options={
          projects.data.map((project) => ({
            key: "dom-opt-" + project.id,
            value: project.id,
            text: project.name,
            content: <Header
              content={
                project.name
              }
            // subheader={domain.name}
            />
          }))
        }
        value={selected}
        onChange={this.handleChange} />
    )
  }
}

ProjectDropdown.propTypes = {
  selected: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number)
  ]),
  onSelected: PropTypes.func,
  search: PropTypes.bool,
  multiple: PropTypes.bool
}

ProjectDropdown.defaultProps = {
  search: false,
  multiple: false
}

const mapStateToProps = (state, ownProps) => {
  return {
    projects: state.core_project_list
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch: dispatch,
    loadProjects: () => {
      dispatch(loadProjects())
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectDropdown)
