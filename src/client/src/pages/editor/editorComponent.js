import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Route, Switch, withRouter } from 'react-router-dom';

import { Modal } from 'semantic-ui-react';

import { loadEditingBoreholes } from '@ist-supsi/bmsjs';

import _ from 'lodash';

import BoreholeForm from '../../commons/form/borehole/boreholeForm';
import MapComponent from '../../commons/map/mapComponent';
import BoreholeEditorTable from '../../commons/table/boreholeEditorTable';
import MenuEditorSearch from '../../commons/menu/editor/menuEditorSearch';
import MenuEditorForm from '../../commons/menu/editor/menuEditorForm';
import MenuContainer from '../../commons/menu/menuContainer';
import WorkflowForm from '../../commons/form/workflow/workflowForm';
import MultipleForm from '../../commons/form/multiple/multipleForm';

// const EditorComponent = function (props) {

class EditorComponent extends React.Component {
  constructor(props) {
    super(props);
    this.rowHover = null;
    this.state = {
      hover: null,
      maphover: null,
    };
  }

  render() {
    const props = this.props;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}>
        <MenuContainer />
        <div
          style={{
            flex: '1 1 100%',
            display: 'flex',
            flexDirection: 'row',
            overflow: 'hidden',
          }}>
          <div
            style={{
              // borderRight: 'thin solid #dfe0e0',
              boxShadow: 'rgba(0, 0, 0, 0.17) 2px 6px 6px 0px',
              display: 'flex',
              flexDirection: 'column',
              width: '250px',
            }}>
            <Switch>
              <Route
                component={MenuEditorSearch}
                exact
                path={process.env.PUBLIC_URL + '/editor'}
              />
              <Route
                component={MenuEditorForm}
                // onTimeout={()=>{

                // }}
                path={process.env.PUBLIC_URL + '/editor/:id'}
              />
            </Switch>
          </div>

          <div
            style={{
              flex: '1 1 0%',
              display: 'flex',
              flexDirection: 'row',
              overflow: 'hidden',
            }}>
            <Switch>
              <Route
                exact
                path={process.env.PUBLIC_URL + '/editor'}
                render={() => (
                  <div
                    style={{
                      flex: '1 1.5 100%',
                      // padding: "1em",
                      // boxShadow: 'rgba(0, 0, 0, 0.5) 0px 0px 8px 0px inset',
                      display: 'flex',
                      flexDirection: 'column',
                    }}>
                    <Modal
                      onUnmount={() => {
                        // props.multipleSelected(null);
                        props.loadEditingBoreholes(
                          props.editor.page,
                          props.search.filter,
                          props.editor.direction,
                        );
                      }}
                      // open={props.store.mselected}
                      open={Array.isArray(props.store.mselected)}>
                      <Modal.Content
                        style={
                          {
                            // maxHeight: '600px',
                            // overflowY: 'auto'
                          }
                        }>
                        <MultipleForm selected={props.store.mselected} />
                      </Modal.Content>
                    </Modal>

                    <div
                      style={{
                        flex: '1 1 50%',
                        height: '50%',
                      }}>
                      <MapComponent
                        // centerto={
                        //   search.center2selected
                        //   && setting.data.appearance.explorer !== 0 ?
                        //     detail.borehole !== null?
                        //       detail.borehole.id : null
                        //     : null
                        // }
                        filter={{
                          ...props.search.filter,
                        }}
                        highlighted={
                          this.state.hover !== null ? [this.state.hover.id] : []
                        }
                        hover={id => {
                          this.setState({
                            maphover: id,
                          });
                        }}
                        layers={props.setting.data.map.explorer}
                        // moveend={(features, extent) => {
                        //   this.props.filterByExtent(extent);
                        // }}
                        selected={id => {
                          // this.props.boreholeSeleced(id);
                          if (id !== null) {
                            props.lock(id);
                          }
                        }}
                        // zoomto={
                        //   search.zoom2selected
                        //   && setting.data.appearance.explorer !== 0
                        // }
                      />
                    </div>
                    <div
                      style={{
                        flex: '1 0 50%',
                        overflowY: 'auto',
                      }}>
                      <BoreholeEditorTable
                        activeItem={
                          !_.isNil(props.store.bselected)
                            ? props.store.bselected.id
                            : null
                        }
                        filter={{
                          ...props.search.filter,
                        }}
                        highlight={this.state.maphover}
                        onDelete={selection => {
                          props.delete(selection, props.search.filter);
                        }}
                        onHover={item => {
                          if (this.rowHover) {
                            clearTimeout(this.rowHover);
                            this.rowHover = false;
                          }
                          this.rowHover = setTimeout(() => {
                            this.setState({
                              hover: item,
                            });
                          }, 250);
                        }}
                        onMultiple={selection => {
                          props.multipleSelected(
                            selection,
                            props.search.filter,
                          );
                        }}
                        onSelected={borehole => {
                          // Lock borehole
                          if (borehole !== null) {
                            props.lock(borehole.id);
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              />
              <Route
                exact={false}
                path={process.env.PUBLIC_URL + '/editor/:id'}
                render={() => (
                  <div
                    style={{
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      flex: '1 1 100%',
                      flexDirection: 'column',
                      padding: '1em',
                    }}>
                    <BoreholeForm />
                  </div>
                )}
              />
            </Switch>
          </div>

          <Switch>
            <Route
              component={({ match }) => (
                <div
                  style={{
                    width: '300px',
                    boxShadow: 'rgba(0, 0, 0, 0.17) -2px 6px 6px 0px',
                    padding: '1em',
                  }}>
                  <WorkflowForm id={parseInt(match.params.id, 10)} />
                </div>
              )}
              path={process.env.PUBLIC_URL + '/editor/:id'}
            />
          </Switch>
        </div>
      </div>
    );
  }

  // }
}

EditorComponent.propTypes = {
  delete: PropTypes.func,
  editor: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
  loadEditingBoreholes: PropTypes.func,
  lock: PropTypes.func,
  multipleSelected: PropTypes.func,
  search: PropTypes.object,
  store: PropTypes.object,
};

const mapStateToProps = state => {
  return {
    bcnt: state.core_borehole_list.dlen,
    editor: state.core_borehole_editor_list,
    pcnt: state.core_project_list.dlen,
    scnt: state.core_stratigraphy_list.dlen,
    search: state.searchEditor,
    setting: state.setting,
    store: state.editor,
    user: state.core_user,
  };
};

const mapDispatchToProps = (dispatch, ownprops) => {
  return {
    dispatch: dispatch,
    projectSelected: project => {
      dispatch({
        type: 'EDITOR_PROJECT_SELECTED',
        selected: project,
      });
    },
    boreholeSelected: borehole => {
      dispatch({
        type: 'EDITOR_BOREHOLE_SELECTED',
        selected: borehole,
      });
    },
    lock: id => {
      dispatch({
        type: 'CLEAR',
        path: '/borehole',
      });
      ownprops.history.push(process.env.PUBLIC_URL + '/editor/' + id);
    },
    multipleSelected: (selection, filter = null) => {
      dispatch({
        type: 'EDITOR_MULTIPLE_SELECTED',
        selection: selection,
        filter: filter,
      });
    },
    delete: (selection, filter = null) => {
      dispatch({
        type: 'EDITOR_MULTIPLE_DELETION',
        selection: selection,
        filter: filter,
      });
    },
    loadEditingBoreholes: (page, filter = {}, direction = null) => {
      dispatch(loadEditingBoreholes(page, 100, filter, 'creation', direction));
    },
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(EditorComponent),
);
