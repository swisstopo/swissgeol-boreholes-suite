import React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import TableComponent from './tableComponent';

import {
  Table
} from 'semantic-ui-react';

import {
  loadProjects
} from '@ist-supsi/bmsjs';

class ProjectTable extends TableComponent {
  getHeader() {
    return (
      <Table.Row>
        <Table.HeaderCell>id</Table.HeaderCell>
        <Table.HeaderCell>name</Table.HeaderCell>
      </Table.Row>
    );
  }
  getCols(item, idx) {
    return ([
      <Table.Cell key={this.uid + "_" + idx + "_1"}>
        {item.id}
      </Table.Cell>,
      <Table.Cell key={this.uid + "_" + idx + "_2"}>
        {item.name}
      </Table.Cell>
    ]);
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    store: state.core_project_list,
    ...ownProps
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch: dispatch,
    loadData: (page, filter = {}) => {
      dispatch(loadProjects(page, 100, filter));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation('grid')(ProjectTable));
