import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import {
  Button,
  Divider,
  Message,
  Icon,
  Segment,
  Form,
  Radio,
} from 'semantic-ui-react';

import WorkgroupRadioGroup from '../../commons/form/workgroup/radio';
import WorkgroupMultiselect from '../../commons/form/workgroup/multi';
import SupplierRadioGroup from '../../commons/form/supplier/radio';
import TranslationText from '../../commons/form/translationText';
import DateText from '../../commons/form/dateText';

import DownloadLink from '../../commons/files/downloadlink';

import {
  // exportDatabase,
  exportDatabaseAsync,
  exportDatabaseStatus,
  exportDatabaseCancel,
  importDatabaseWorkgroup,
  importDatabaseSupplier,
  importDatabaseNewSupplier,
  listWorkgroups,
  getWorkgroups,
  reloadUser,
} from '@ist-supsi/bmsjs';

class DatabaseSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      export: false,
      restore: false,
      exportWorkgroup: [],
      // enabledWorkgroups: props.user.data.workgroups.filter(
      //   w => w.disabled === null && w.supplier === false
      // ),
      enabledWorkgroups: [],
      importWorkgroup: null,
      importSupplier: null,
      importType: 'existingWorkgroup',
      file: null,
      supplierName: '',
      suppliers: [],
      supplier: null,

      exporting: false,
      importing: false,

      fetchingStatus: true,
      lastExport: null,
    };
    this.checkStatus = this.checkStatus.bind(this);
    this.countExportableBoreholes = this.countExportableBoreholes.bind(this);
    this.reset = this.reset.bind(this);
  }

  componentDidMount() {
    this.reset();
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  checkStatus() {
    this.setState(
      {
        fetchingStatus: true,
      },
      () => {
        exportDatabaseStatus().then(r => {
          if (r.data.success === true) {
            const status = r.data.data.status;

            // No exports have been done so far
            if (status === 'empty') {
              this.setState(
                {
                  fetchingStatus: false,
                  lastExport: null,
                },
                () => {
                  if (this.timer) {
                    clearInterval(this.timer);
                    this.timer = null;
                  }
                },
              );

              // an export is currently running
            } else if (status === 'running') {
              this.setState(
                {
                  fetchingStatus: true,
                  lastExport: null,
                },
                () => {
                  if (!this.timer) {
                    this.timer = setInterval(() => {
                      this.checkStatus();
                    }, 2000);
                  }
                },
              );

              // an export is finished and ready to be downloaded
            } else if (status === 'done') {
              this.setState(
                {
                  fetchingStatus: false,
                  lastExport: r.data.data,
                },
                () => {
                  if (this.timer) {
                    clearInterval(this.timer);
                    this.timer = null;
                  }
                },
              );
            }
          }
        });
      },
    );
  }

  reset() {
    getWorkgroups().then(r => {
      if (r.data.success === true) {
        const enabledWorkgroups = r.data.data.filter(w => w.disabled === null);
        const suppliers = r.data.data.filter(w => w.supplier === true);
        this.setState(
          {
            // export: false,
            // exportWorkgroup: [],
            enabledWorkgroups: enabledWorkgroups,
            importWorkgroup: null,
            importSupplier: null,
            importType: 'existingWorkgroup',
            file: null,
            supplierName: '',
            suppliers: suppliers,
            supplier: null,

            exporting: false,
            importing: false,

            fetchingStatus: true,
            lastExport: null,
          },
          () => {
            this.checkStatus();
          },
        );
      } else {
        this.setState(
          {
            // export: false,
            exportWorkgroup: [],
            enabledWorkgroups: [],
            importWorkgroup: null,
            importSupplier: null,
            importType: 'existingWorkgroup',
            file: null,
            supplierName: '',
            suppliers: [],
            supplier: null,

            exporting: false,
            importing: false,

            fetchingStatus: true,
            lastExport: null,
          },
          () => {
            this.checkStatus();
          },
        );
      }
    });
  }

  countExportableBoreholes() {
    const { enabledWorkgroups, exportWorkgroup } = this.state;

    if (exportWorkgroup.length === 0) {
      return 0;
    }
    const selected = enabledWorkgroups.filter(
      w => exportWorkgroup.indexOf(w.id) > -1,
    );
    let total = 0;
    selected.forEach(el => {
      total += el.boreholes;
    });
    return total;
  }

  render() {
    const { t } = this.props;
    return (
      <div
        style={{
          padding: '2em',
          flex: 1,
        }}>
        <div
          onClick={() => {
            this.setState({
              export: !this.state.export,
            });
          }}
          style={{
            flexDirection: 'row',
            display: 'flex',
            cursor: 'pointer',
            backgroundColor: this.state.export ? '#f5f5f5' : '#fff',
            padding: 10,
          }}>
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: 18,
                fontWeight: 'bold',
              }}>
              <TranslationText id="export" />
            </div>
            <TranslationText id="export_database" />
          </div>
          <div
            style={{
              flex: 1,
              textAlign: 'right',
            }}>
            <Button color="red" size="small">
              {this.state.export === true ? t('collapse') : t('expand')}
            </Button>
          </div>
        </div>
        {this.state.export === true ? (
          <Segment style={{ margin: 0 }}>
            <WorkgroupMultiselect
              key="web-bdms-db-setting-1"
              nameKey="name"
              onChange={workgroup => {
                this.setState({
                  exportWorkgroup: workgroup,
                });
              }}
              workgroups={this.state.enabledWorkgroups}
            />
            <div
              key="web-bdms-db-setting-2"
              style={{
                marginTop: '1.5em',
              }}>
              <Button
                disabled={
                  this.state.exporting === true ||
                  this.state.exportWorkgroup.length === 0
                }
                loading={
                  this.state.fetchingStatus === true ||
                  this.state.exporting === true
                }
                onClick={() => {
                  this.setState(
                    {
                      exporting: true,
                    },
                    () => {
                      exportDatabaseAsync(this.state.exportWorkgroup).then(
                        response => {
                          console.log(response);
                          if (response.data.success === false) {
                            alert(response.data.message);
                          }
                          this.reset();
                        },
                      );
                      // exportDatabase(
                      //   this.state.exportWorkgroup
                      // ).then(
                      //   response => {
                      //     if (response.success === false) {
                      //       alert(response.message);
                      //     }
                      //     this.reset();
                      //   }
                      // );
                    },
                  );
                }}
                primary
                size="small">
                <TranslationText id="export" /> &nbsp; (
                {this.countExportableBoreholes()}
                &nbsp;
                <TranslationText id="boreholes" />)
              </Button>
            </div>
            {this.state.fetchingStatus === true ? (
              <div>
                <Divider />
                <Icon loading name="spinner" />
                &nbsp;
                <TranslationText id="exportInProgress" />
                ... &nbsp; (
                <span
                  onClick={() => {
                    exportDatabaseCancel();
                  }}
                  style={{
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    color: 'rgb(33, 133, 208)',
                  }}>
                  <TranslationText id="cancel" />
                </span>
                )
              </div>
            ) : (
              this.state.lastExport !== null && (
                <div>
                  <Divider />
                  <TranslationText id="lastExport" />:
                  <br />
                  <DateText date={this.state.lastExport.date} hours /> (
                  <DateText date={this.state.lastExport.date} fromnow />
                  )
                  <br />
                  <DownloadLink
                    // caption={file.name}
                    id={this.state.lastExport.id}
                  />
                </div>
              )
            )}
          </Segment>
        ) : (
          <Divider style={{ margin: 0 }} />
        )}
        <div
          onClick={() => {
            this.setState({
              restore: !this.state.restore,
            });
          }}
          style={{
            flexDirection: 'row',
            display: 'flex',
            cursor: 'pointer',
            backgroundColor: this.state.restore ? '#f5f5f5' : '#fff',
            padding: 10,
          }}>
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: 18,
                fontWeight: 'bold',
              }}>
              <TranslationText id="import" />
            </div>
            <TranslationText id="import_database" />
          </div>
          <div
            style={{
              flex: 1,
              textAlign: 'right',
            }}>
            <Button color="red" size="small">
              {this.state.restore === true ? t('collapse') : t('expand')}
            </Button>
          </div>
        </div>
        {this.state.restore === true ? (
          <Segment style={{ margin: 0 }}>
            <div
              // style={{ margin: 0 }}
              style={{
                marginBottom: '1em',
                padding: '1em',
              }}>
              <Form>
                <Form.Field>
                  <Radio
                    checked={this.state.importType === 'existingWorkgroup'}
                    label="Add to an existing regular workgroup (data can be edited later):"
                    name="radioGroup"
                    onChange={() =>
                      this.setState({ importType: 'existingWorkgroup' })
                    }
                    value="existingWorkgroup"
                  />
                </Form.Field>
                <Form.Field>
                  <Radio
                    checked={this.state.importType === 'newSupplier'}
                    label='Import into a new "supplier" workgroup:'
                    name="radioGroup"
                    onChange={() =>
                      this.setState({ importType: 'newSupplier' })
                    }
                    value="newSupplier"
                  />
                </Form.Field>
                {this.state.suppliers.length > 0 ? (
                  <Form.Field>
                    <Radio
                      checked={this.state.importType === 'existingSupplier'}
                      label='⚠️ Delete and rewrite the data into an existing "supplier" workgroup:'
                      name="radioGroup"
                      onChange={() =>
                        this.setState({ importType: 'existingSupplier' })
                      }
                      value="existingSupplier"
                    />
                  </Form.Field>
                ) : null}
              </Form>
              {this.state.importType === 'newSupplier' ? (
                <Message info>
                  <Message.Header>Information</Message.Header>
                  <p>
                    You are creating a new "supplier" workgroup. Imported data
                    will be read only. And you will be able only to decide if
                    make them public or not.
                  </p>
                </Message>
              ) : null}
              {this.state.importType === 'existingSupplier' ? (
                <Message warning>
                  <Message.Header>Warning!</Message.Header>
                  <p>
                    Importing into an existing supplier workgroup, will delete
                    and replace all previously uploaded data.
                  </p>
                </Message>
              ) : null}
              {this.state.importType === 'existingWorkgroup' ? (
                <Message info>
                  <Message.Header>Information</Message.Header>
                  <p>
                    You are adding data to a regular workgroup. Using this
                    option all the data will be editable as normally inserted.
                  </p>
                </Message>
              ) : null}
              <Segment>
                {this.state.importType === 'newSupplier' ? (
                  <div>
                    <Form.Input
                      fluid
                      label="Supplier name"
                      onChange={e => {
                        this.setState({
                          supplierName: e.target.value,
                        });
                      }}
                      placeholder={t('workgroup')}
                      value={this.state.supplierName}
                    />
                  </div>
                ) : null}
                {this.state.importType === 'existingSupplier' ? (
                  <div>
                    <div
                      className="flex_fill"
                      style={{
                        paddingLeft: '1em',
                      }}>
                      <SupplierRadioGroup
                        filter={this.state.importSupplier}
                        onChange={supplier => {
                          this.setState({
                            importSupplier: supplier,
                          });
                        }}
                        suppliers={this.state.suppliers}
                      />
                    </div>
                  </div>
                ) : null}
                {this.state.importType === 'existingWorkgroup' ? (
                  <div>
                    <div
                      className="flex_fill"
                      style={{
                        paddingLeft: '1em',
                      }}>
                      <WorkgroupRadioGroup
                        all={false}
                        filter={this.state.importWorkgroup}
                        nameKey="name"
                        onChange={workgroup => {
                          this.setState({
                            importWorkgroup: workgroup,
                          });
                        }}
                        workgroups={this.state.enabledWorkgroups.filter(
                          w => w.supplier === false,
                        )}
                      />
                    </div>
                  </div>
                ) : null}
                <input
                  onChange={e => {
                    this.setState({
                      file: e.target.files[0],
                    });
                  }}
                  ref={e => (this.input = e)}
                  style={{
                    fontFamily: 'inherit',
                  }}
                  type="file"
                />
                <div
                  style={{
                    // textAlign: 'center'
                    marginTop: '1.5em',
                  }}>
                  <Button
                    disabled={
                      this.state.importing === true ||
                      !this.state.file ||
                      (this.state.importType === 'newSupplier' &&
                        !this.state.supplierName) ||
                      (this.state.importType === 'existingSupplier' &&
                        !this.state.importSupplier) ||
                      (this.state.importType === 'existingWorkgroup' &&
                        !this.state.importWorkgroup)
                    }
                    loading={this.state.importing === true}
                    negative={this.state.importType === 'existingSupplier'}
                    onClick={() => {
                      this.setState(
                        {
                          importing: true,
                        },
                        () => {
                          if (this.state.importType === 'newSupplier') {
                            importDatabaseNewSupplier(
                              this.state.supplierName,
                              this.state.file,
                            ).then(response => {
                              this.reset();
                              this.props.reloadUser();
                            });
                          } else if (
                            this.state.importType === 'existingSupplier'
                          ) {
                            importDatabaseSupplier(
                              this.state.importSupplier,
                              this.state.file,
                            ).then(response => {
                              this.reset();
                            });
                          } else if (
                            this.state.importType === 'existingWorkgroup'
                          ) {
                            importDatabaseWorkgroup(
                              this.state.importWorkgroup,
                              this.state.file,
                            ).then(response => {
                              this.reset();
                            });
                          }
                        },
                      );
                    }}
                    primary={this.state.importType !== 'existingSupplier'}
                    size="small">
                    Import
                  </Button>
                </div>
              </Segment>
            </div>
          </Segment>
        ) : (
          <Divider style={{ margin: 0 }} />
        )}
      </div>
    );
  }
}

DatabaseSettings.propTypes = {
  listWorkgroups: PropTypes.func,
  reloadUser: PropTypes.func,
  t: PropTypes.func,
  workgroups: PropTypes.object,
};

// DatabaseSettings.defaultProps = {
// };

const mapStateToProps = state => {
  return {
    user: state.core_user,
    workgroups: state.core_workgroups,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    reloadUser: () => {
      dispatch(reloadUser());
    },
    listWorkgroups: (ru = false) => {
      return dispatch(listWorkgroups());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation(['common'])(DatabaseSettings));
