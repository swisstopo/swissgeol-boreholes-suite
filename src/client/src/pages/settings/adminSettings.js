import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import {
  Button,
  Checkbox,
  Icon,
  Input,
  Label,
  Modal,
  Table,
  Form,
} from 'semantic-ui-react';

import {
  createUser,
  createWorkgroup,
  enableWorkgroup,
  disableWorkgroup,
  deleteWorkgroup,
  updateWorkgroup,
  deleteUser,
  disableUser,
  enableUser,
  updateUser,
  setRole,
  listUsers,
  listWorkgroups,
  reloadUser,
} from '../../api-lib/index';

import DateText from '../../commons/form/dateText';
import TranslationText from '../../commons/form/translationText';


class AdminSettings extends React.Component {

  constructor(props) {
    super(props);
    this.setRole = this.setRole.bind(this);
    this.state = {
      "deleteUser": null,
      "deleteWorkgroup": null,
      "usersFilter": 'enabled', // 'all', 'enabled' or 'disabled',
      "usersSearch": '',
      "workgroupFilter": 'enabled', // 'all', 'enabled' or 'disabled',
      "workgroupsSearch": '',
      "users": false,
      "workgroups": false,

      "roleUpdate": false,

      "user": null,
      "uId": null,
      "uAdmin": false,
      "uUsername": "", 
      "uPassword": "", 
      "uFirstname": "", 
      "uLastname": "", 
      "uDisabled": null,

      "workgroup": null,
      "wId": null,
      "wName": "",
      "wDisabled": ""
    };
    this.reset = this.reset.bind(this);
  }

  componentDidMount(){
    this.props.listUsers();
    this.props.listWorkgroups();
  }

  componentDidUpdate(prevProps){
    if (
      this.state.user !== null
      && prevProps.users.fcnt !== this.props.users.fcnt
    ) {
      for (let index = 0; index < this.props.users.data.length; index++) {
        const user = this.props.users.data[index];
        if (user.id === this.state.user.id){
          this.setState({
            user: user
          });
          break;
        }
      }
    }
  }

  reset(state, andThen){
    this.setState({
      "user": null,
      "uId": null,
      "uUsername": "", 
      "uPassword": "", 
      "uFirstname": "", 
      "uLastname":"", 
      "uDisabled": null,
      ...state
    }, ()=>{
      if (andThen !== undefined){
        andThen();
      }
    });
  }

  resetWorkgroup(state, andThen){
    this.setState({
      "workgroup": null,
      "wId": null,
      "wName": "", 
      "wDisabled": null,
      ...state
    }, ()=>{
      if (andThen !== undefined){
        andThen();
      }
    });
  }

  setRole(uwg, workgroup, role){
    this.setState({
      roleUpdate: true
    }, () => {
      if (
        uwg !== undefined
        && uwg.roles.indexOf(role) >= 0
      ) {
        // Remove role
        setRole(
          this.state.user.id,
          workgroup.id,
          role,
          false
        ).then((response)=>{
          this.props.listUsers().then(
            ()=>{
              this.props.listWorkgroups(true);
            }
          );
        });
      } else {
        setRole(
          this.state.user.id,
          workgroup.id,
          role
        ).then((response)=>{
          this.props.listUsers().then(
            ()=>{
              this.props.listWorkgroups(true);
            }
          );
        });
      }
    });
  }

  render() {
    const { t } = this.props;
    return (
      <div
        style={{
          padding: '2em',
          flex: 1,
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        <div
          style={{
            flex: '1 1 100%',
            marginRight: '0.5em'
          }}
        >
          <div
            style={{
              marginBottom: '0.5em'
            }}
          >
            {
              this.state.user !== null?
                <span
                  className='linker link'
                  onClick={()=>{
                    this.reset();
                  }}
                >
                  {
                    t(
                      'new',
                      {
                        what: t('user')
                      }
                    )
                  }
                </span>: <span>&nbsp;</span>
            }
          </div>
          <Form>
            <Form.Group
              widths='equal'
            >
              <Form.Input
                fluid
                // label={t('username')}
                label={
                  <TranslationText
                    id="username"
                  />
                }
                onChange={(e)=>{
                  this.setState({
                    uUsername: e.target.value
                  });
                }}
                placeholder={t('username')}
                value={this.state.uUsername}
              />
              <Form.Input
                autoComplete='new-password'
                fluid
                // label={t('password')}
                label={
                  <TranslationText
                    id="password"
                  />
                }
                onChange={(e)=>{
                  this.setState({
                    uPassword: e.target.value
                  });
                }}
                placeholder={t('password')}
                type='password'
                value={this.state.uPassword}
              />
              <Form.Input
                fluid
                label={
                  <TranslationText
                    id="firstname"
                  />
                }
                onChange={(e)=>{
                  this.setState({
                    uFirstname: e.target.value
                  });
                }}
                placeholder={t('firstname')}
                value={this.state.uFirstname}
              />
              <Form.Input
                autoComplete='off'
                fluid
                label={
                  <TranslationText
                    id="lastname"
                  />
                }
                onChange={(e)=>{
                  this.setState({
                    uLastname: e.target.value
                  });
                }}
                placeholder={t('lastname')}
                value={this.state.uLastname}
              />
              <Form.Field>
                <label>
                  <TranslationText
                    id="admin"
                  />
                </label>
                <div
                  className='ui fluid input'
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'row',
                    height: '38px'
                  }}
                >
                  <div
                    style={{
                      flex: '1 1 100%'
                    }}
                    title={
                      this.state.uId !== null
                      && this.props.user.data.username === this.state.uUsername?
                        t('disabled'): null
                    }
                  >
                    <Checkbox
                      checked={this.state.uAdmin}
                      disabled={
                        this.state.uId !== null
                        && this.props.user.data.username === this.state.uUsername
                      }
                      onChange={()=>{
                        this.setState({
                          uAdmin: !this.state.uAdmin
                        });
                      }}
                      toggle
                    />
                  </div>
                </div>
              </Form.Field>
              <div
                style={{
                  flex: '0 0 0% !important'
                }}
              >
                <Form.Button
                  icon
                  label='&nbsp;'
                  onClick={()=>{
                    if (this.state.uId === null){
                      createUser(
                        this.state.uUsername,
                        this.state.uPassword,
                        this.state.uFirstname,
                        '',
                        this.state.uLastname,
                        this.state.uAdmin
                      ).then((response)=>{
                        if (response.data.success === false) {
                          alert(response.data.message);
                        } else {
                          this.props.listUsers();
                          // this.props.reloadUser();
                        }
                      });
                    } else {
                      updateUser(
                        this.state.uId,
                        this.state.uUsername,
                        this.state.uPassword,
                        this.state.uFirstname,
                        '',
                        this.state.uLastname,
                        this.state.uAdmin
                      ).then((response)=>{
                        if (response.data.success === false) {
                          alert(response.data.message);
                        } else {
                          this.props.listUsers();
                          // this.props.reloadUser();
                        }
                      });
                    }
                  }}
                >
                  {
                    this.state.uId !== null?
                      <Icon name='save' />:  <Icon name='plus' />
                  }
                </Form.Button>
              </div>
            </Form.Group>
          </Form>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'row'
            }}
          >
            {
              this.state.usersFilter !== 'all'
              || this.state.usersSearch !== ''?
                <div
                  className='linker link'
                  onClick={()=>{
                    this.setState({
                      usersFilter: 'all',
                      usersSearch: ''
                    });
                  }}
                  style={{
                    marginRight: '1em',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <TranslationText
                    extra={{ what: t('all') }}
                    id="show"
                  />
                  {
                    this.props.developer.debug === true?
                      <div
                        style={{
                          color: 'red',
                        }}
                      >
                        trans=all
                      </div>: null
                  }
                </div>: null
            }
            {
              this.state.usersFilter !== 'enabled'
              && this.state.usersSearch === ''?
                <div
                  className='linker link'
                  onClick={()=>{
                    this.setState({
                      usersFilter: 'enabled',
                    });
                  }}
                  style={{
                    marginRight: '1em',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <TranslationText
                    extra={{ what: t('enabled') }}
                    id="show"
                  />
                  {
                    this.props.developer.debug === true?
                      <div
                        style={{
                          color: 'red',
                        }}
                      >
                        trans=enabled
                      </div>: null
                  }
                </div>: null
            }
            {
              this.state.usersFilter !== 'disabled'
              && this.state.usersSearch === ''?
                <div
                  className='linker link'
                  onClick={()=>{
                    this.setState({
                      usersFilter: 'disabled',
                    });
                  }}
                  style={{
                    marginRight: '1em',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <TranslationText
                    extra={{ what: t('disabled') }}
                    id="show"
                  />
                  {
                    this.props.developer.debug === true?
                      <div
                        style={{
                          color: 'red',
                        }}
                      >
                        trans=disabled
                      </div>: null
                  }
                </div>: null
            }
            <div style={{ flex: '1 1 100%' }} />
            <div>
              <Input
                icon='search'
                onChange={(e) => {
                  this.reset({
                    "usersSearch": e.target.value
                  });
                }}
                placeholder={t('search')}
                size='mini'
                value={this.state.usersSearch}
              />
            </div>
          </div>
          <div
            style={{
              marginTop: '1em',
              maxHeight: '400px',
              overflowY: 'auto',
            }}
          >
            <Modal
              inverted
              onClose={()=>{
                this.setState({
                  deleteUser: null
                });
              }}
              open={this.state.deleteUser !== null}
              size='tiny'
            >
              <Modal.Header>
                {
                  this.state.deleteUser !== null
                  && this.state.deleteUser.disabled !== null?
                    t('enabling', { what: t('user') }):
                    t('disabling', { what: t('user') })
                }
              </Modal.Header>
              <Modal.Content>
                {
                  this.state.deleteUser === null?
                    null:
                    this.state.deleteUser.disabled !== null?
                      <Modal.Description>
                        <p>
                          <TranslationText
                            extra={{ user: this.state.deleteUser.username }}
                            id="enablingUser"
                          />
                        </p>
                      </Modal.Description>:
                      this.state.deleteUser !== null
                      && this.state.deleteUser.contributions === 0?
                        <Modal.Description>
                          <p>
                            <TranslationText
                              id="msgDeleteUser"
                            />
                          </p>
                          <ul>
                            <li>
                              <span
                                style={{
                                  fontWeight: 'bold',
                                  textTransform: 'capitalize'
                                }}
                              >
                                <TranslationText
                                  id="disable"
                                />:
                              </span>
                              <br />
                              <TranslationText
                                id="msgReenablingTip"
                              />
                              <br />
                              &nbsp;
                            </li>
                            <li>
                              <span
                                style={{
                                  fontWeight: 'bold',
                                  textTransform: 'capitalize'
                                }}
                              >
                                <TranslationText
                                  id="deleteForever"
                                />
                              </span>
                              <br />
                              <TranslationText
                                id="msgDeletingUserTip"
                              />
                            </li>
                          </ul>
                        </Modal.Description>:
                        <Modal.Description>
                          <p>
                            <TranslationText
                              id="msgDisablingUser"
                            />
                          </p>
                          <ul>
                            <li>
                              <span
                                style={{
                                  fontWeight: 'bold',
                                  textTransform: 'capitalize'
                                }}
                              >
                                <TranslationText
                                  id="disable"
                                />:
                              </span>
                              <br />
                              <TranslationText
                                id="msgReenablingTip"
                              />
                            </li>
                          </ul>
                        </Modal.Description>
                }
              </Modal.Content>
              <Modal.Actions>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row'
                  }}
                >
                  <Button
                    basic
                    color='black'
                    onClick={()=>{
                      this.setState({
                        deleteUser: null
                      });
                    }}
                  >
                    <span
                      style={{
                        textTransform: 'capitalize',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <TranslationText
                        id="cancel"
                      />
                    </span>
                  </Button>
                  <div style={{ flex: '1 1 100%' }} />
                  {
                    this.state.deleteUser === null?
                      null:
                      this.state.deleteUser.disabled !== null?
                        <Button
                          onClick={(e)=>{
                            enableUser(
                              this.state.deleteUser.id
                            ).then(()=>{
                              this.setState({
                                deleteUser: null
                              }, () => {
                                this.props.listUsers();
                                // this.props.reloadUser();
                              });
                            });
                          }}
                          secondary
                        >
                          <span
                            style={{
                              textTransform: 'capitalize',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <TranslationText
                              id="enable"
                            />
                          </span>
                        </Button>:
                        <Button
                          onClick={(e)=>{
                            disableUser(
                              this.state.deleteUser.id
                            ).then(()=>{
                              this.reset({
                                "deleteUser": null
                              }, this.props.listUsers);
                            });
                          }}
                          secondary
                        >
                          <span
                            style={{
                              textTransform: 'capitalize',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <TranslationText
                              id="disable"
                            />
                          </span>
                        </Button>
                  }
                  {
                    this.state.deleteUser !== null
                    && this.state.deleteUser.disabled === null
                    && this.state.deleteUser.contributions === 0?
                      <Button
                        color='red'
                        onClick={(e)=>{
                          deleteUser(
                            this.state.deleteUser.id
                          ).then(()=>{
                            this.reset({
                              "deleteUser": null
                            }, this.props.listUsers);
                          });
                        }}
                      >
                        <span
                          style={{
                            textTransform: 'capitalize',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <TranslationText
                            id="deleteForever"
                          />
                        </span>
                      </Button>: null
                  }
                </div>
              </Modal.Actions>
            </Modal>
            <Table
              celled
              compact
              selectable
              size='small'
            >
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>
                    <TranslationText
                      id="username"
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    <TranslationText
                      id="firstname"
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    <TranslationText
                      id="lastname"
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    colSpan='2'
                    style={{
                      width: '4em'
                    }}
                  >
                    <TranslationText
                      id="admin"
                    />
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {
                  this.props.users.data.map((currentUser, idx)=>(
                    (
                      this.state.usersSearch !== ''
                      && (
                        currentUser.username.toUpperCase().includes(
                          this.state.usersSearch.toUpperCase()
                        )
                        || currentUser.firstname.toUpperCase().includes(
                          this.state.usersSearch.toUpperCase()
                        )
                        || currentUser.lastname.toUpperCase().includes(
                          this.state.usersSearch.toUpperCase()
                        )
                      )
                    ) || (
                      this.state.usersSearch === ''
                      && (
                        this.state.usersFilter === 'all'
                        || (
                          this.state.usersFilter === 'disabled'
                          && currentUser.disabled !== null
                        ) || (
                          this.state.usersFilter === 'enabled'
                          && currentUser.disabled === null
                        )
                      )
                    )?
                      <Table.Row
                        active={
                          this.state.uId === currentUser.id
                        }
                        error={currentUser.disabled !== null}
                        key={"stng-users-" + currentUser.id}
                        onClick={()=>{
                          if (this.state.uId === currentUser.id){
                            this.reset();
                          } else {
                            this.setState({
                              "user": currentUser,
                              "uId": currentUser.id,
                              "uAdmin": currentUser.admin,
                              "uUsername": currentUser.username, 
                              "uPassword": "", 
                              "uFirstname": currentUser.firstname, 
                              "uLastname": currentUser.lastname, 
                              "uDisabled": currentUser.disabled
                            });
                          }
                        }}
                      >
                        <Table.Cell>
                          {
                            currentUser.disabled !== null?
                              <Label
                                circular
                                color={'red'}
                                empty
                                style={{
                                  marginRight: '1em'
                                }}
                              />: null
                          }
                          {currentUser.username} {
                            currentUser.disabled !== null?
                              <span
                                style={{
                                  color: '#787878',
                                  fontStyle: 'italic',
                                  marginLeft: '0.5em',
                                }}
                              >
                                <TranslationText
                                  id="disabled"
                                />
                                &nbsp;
                                <DateText
                                  date={currentUser.disabled}
                                  fromnow
                                />&nbsp;(
                                <DateText
                                  date={currentUser.disabled}
                                  hours
                                />)
                              </span>: null
                          }
                        </Table.Cell>
                        <Table.Cell>{currentUser.firstname}</Table.Cell>
                        <Table.Cell>{currentUser.lastname}</Table.Cell>
                        <Table.Cell
                          textAlign='center'
                        >
                          {
                            currentUser.admin === true?
                              <TranslationText
                                id="yes"
                              />:
                              <TranslationText
                                id="no"
                              />
                          }
                        </Table.Cell>
                        <Table.Cell
                          style={{
                            textAlign: 'center',
                            width: '4em'
                          }}
                        >
                          <span
                            className='linker link'
                            onClick={(e)=>{
                              e.stopPropagation();
                              this.setState({
                                deleteUser: currentUser
                              });
                            }}
                          >
                            {
                              currentUser.disabled !== null? // isDisabled
                                <TranslationText
                                  id="enable"
                                />:
                                <TranslationText
                                  id="disable"
                                />
                            }
                          </span>
                        </Table.Cell>
                      </Table.Row>: null
                  ))
                }
              </Table.Body>
            </Table>
          </div>
        </div>
        <div
          style={{
            flex: '1 1 100%',
            marginLeft: '0.5em'
          }}
        >
          {
            this.state.user !== null?
              <div>
                <div
                  style={{
                    marginBottom: '0.5em'
                  }}
                >
                  {
                    this.state.workgroup !== null?
                      <span
                        className='linker link'
                        onClick={()=>{
                          this.resetWorkgroup();
                        }}
                      >
                        <TranslationText
                          extra="workgroup"
                          id="new"
                        />
                      </span>:
                      <span>&nbsp;</span>
                  }
                </div>
                <Form
                  autoComplete='off'
                >
                  <Form.Group
                    autoComplete='off'
                    widths='equal'
                  >
                    <Form.Input
                      fluid
                      label={
                        <TranslationText
                          id="workgroup"
                        />
                      }
                      onChange={(e)=>{
                        this.setState({
                          wName: e.target.value
                        });
                      }}
                      placeholder={t('workgroup')}
                      value={this.state.wName}
                    />
                    <div
                      style={{
                        flex: '0 0 0% !important'
                      }}
                    >
                      <Form.Button
                        icon
                        label='&nbsp;'
                        onClick={()=>{
                          if (this.state.wId === null){
                            createWorkgroup(
                              this.state.wName
                            ).then(() => {
                              this.props.listWorkgroups(true);
                            });
                          } else {
                            updateWorkgroup(
                              this.state.wId,
                              this.state.wName
                            ).then(() => {
                              this.props.listWorkgroups(true);
                            });
                          }

                        }}
                      >
                        {
                          this.state.wId !== null?
                            <Icon name='save' />:
                            <Icon name='plus' />
                        }
                      </Form.Button>
                    </div>
                  </Form.Group>
                </Form>
                <div
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'row'
                  }}
                >
                  {
                    this.state.workgroupFilter !== 'all'
                    || this.state.workgroupsSearch !== ''?
                      <div
                        className='linker link'
                        onClick={()=>{
                          this.setState({
                            workgroupFilter: 'all',
                            workgroupsSearch: ''
                          });
                        }}
                        style={{
                          marginRight: '1em',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <TranslationText
                          extra={{ what: t('all') }}
                          id="show"
                        />
                        {
                          this.props.developer.debug === true?
                            <div
                              style={{
                                color: 'red',
                              }}
                            >
                              trans=all
                            </div>: null
                        }
                      </div>: null
                  }
                  {
                    this.state.workgroupFilter !== 'enabled'
                    && this.state.workgroupsSearch === ''?
                      <div
                        className='linker link'
                        onClick={()=>{
                          this.setState({
                            workgroupFilter: 'enabled',
                          });
                        }}
                        style={{
                          marginRight: '1em',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <TranslationText
                          extra={{ what: t('enabled') }}
                          id="show"
                        />
                        {
                          this.props.developer.debug === true?
                            <div
                              style={{
                                color: 'red',
                              }}
                            >
                              trans=enabled
                            </div>: null
                        }
                      </div>: null
                  }
                  {
                    this.state.workgroupFilter !== 'disabled'
                    && this.state.workgroupsSearch === ''?
                      <div
                        className='linker link'
                        onClick={()=>{
                          this.setState({
                            workgroupFilter: 'disabled',
                          });
                        }}
                        style={{
                          marginRight: '1em',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <TranslationText
                          extra={{ what: t('disabled') }}
                          id="show"
                        />
                        {
                          this.props.developer.debug === true?
                            <div
                              style={{
                                color: 'red',
                              }}
                            >
                              trans=disabled
                            </div>: null
                        }
                      </div>: null
                  }
                  <div style={{ flex: '1 1 100%' }} />
                  <div>
                    <Input
                      icon='search'
                      onChange={(e) => {
                        this.resetWorkgroup({
                          "workgroupsSearch": e.target.value
                        });
                      }}
                      placeholder={t('search')}
                      size='mini'
                      value={this.state.workgroupsSearch}
                    />
                  </div>
                </div>
                <div
                  style={{
                    marginTop: '1em',
                    maxHeight: '400px',
                    overflowY: 'auto',
                  }}
                >
                  <Modal
                    onClose={()=>{
                      this.setState({
                        deleteWorkgroup: null
                      });
                    }}
                    open={this.state.deleteWorkgroup !== null}
                    size='tiny'
                  >
                    <Modal.Header>
                      {
                        this.state.deleteWorkgroup !== null
                        && this.state.deleteWorkgroup.disabled !== null?
                          <TranslationText
                            extra={{ what: t('workgroup') }}
                            id="enabling"
                          />:
                          <TranslationText
                            extra={{ what: t('workgroup') }}
                            id="disabling"
                          />
                      }
                      {
                        this.props.developer.debug === true?
                          <div
                            style={{
                              color: 'red',
                            }}
                          >
                            trans=workgroup
                          </div>: null
                      }
                    </Modal.Header>
                    <Modal.Content>
                      {
                        this.state.deleteWorkgroup === null?
                          null:
                          this.state.deleteWorkgroup.disabled !== null?
                            <Modal.Description>
                              <p>
                                <TranslationText
                                  extra={{
                                    workgroup: this.state.deleteWorkgroup.name
                                  }}
                                  id="msgEnablingWorkgroup"
                                />
                              </p>
                            </Modal.Description>:
                            this.state.deleteWorkgroup !== null
                            && this.state.deleteWorkgroup.boreholes === 0?
                              <Modal.Description>
                                <p>
                                  <TranslationText
                                    id="msgDeleteWorkgroup"
                                  />
                                </p>
                                <ul>
                                  <li>
                                    <span
                                      style={{
                                        fontWeight: 'bold',
                                        textTransform: 'capitalize'
                                      }}
                                    >
                                      <TranslationText
                                        id="disable"
                                      />
                                    </span>
                                    <br />
                                    <TranslationText
                                      id="msgReenablingTip"
                                    />
                                    <br />
                                    &nbsp;
                                  </li>
                                  <li>
                                    <span
                                      style={{
                                        fontWeight: 'bold',
                                        textTransform: 'capitalize'
                                      }}
                                    >
                                      <TranslationText
                                        id="deleteForever"
                                      />:
                                    </span>
                                    <br />
                                    <TranslationText
                                      id="msgDeletingWorkgroupTip"
                                    />
                                  </li>
                                </ul>
                              </Modal.Description>:
                              <Modal.Description>
                                <p>
                                  <TranslationText
                                    id="msgDisablingWorkgroup"
                                  />
                                </p>
                                <ul>
                                  <li>
                                    <span
                                      style={{
                                        fontWeight: 'bold',
                                        textTransform: 'capitalize'
                                      }}
                                    >
                                      <TranslationText
                                        id="disable"
                                      />:
                                    </span>
                                    <br />
                                    <TranslationText
                                      id="msgReenablingTip"
                                    />
                                  </li>
                                </ul>
                              </Modal.Description>
                      }
                    </Modal.Content>
                    <Modal.Actions>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row'
                        }}
                      >
                        <Button
                          onClick={()=>{
                            this.setState({
                              deleteWorkgroup: null
                            });
                          }}
                        >
                          <span
                            style={{
                              textTransform: 'capitalize',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <TranslationText
                              id="cancel"
                            />
                          </span>
                        </Button>
                        <div style={{ flex: '1 1 100%' }} />
                        {
                          this.state.deleteWorkgroup === null?
                            null:
                            this.state.deleteWorkgroup.disabled !== null?
                              <Button
                                onClick={(e)=>{
                                  enableWorkgroup(
                                    this.state.deleteWorkgroup.id
                                  ).then(()=>{
                                    this.setState({
                                      "deleteWorkgroup": null
                                    }, () => {
                                      this.props.listWorkgroups(true);
                                    });
                                  });
                                }}
                                secondary
                              >
                                <span
                                  style={{
                                    textTransform: 'capitalize',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <TranslationText
                                    id="enable"
                                  />
                                </span>
                              </Button>:
                              <Button
                                onClick={(e)=>{
                                  disableWorkgroup(
                                    this.state.deleteWorkgroup.id
                                  ).then(()=>{
                                    this.resetWorkgroup({
                                      "deleteWorkgroup": null
                                    }, () => {
                                      this.props.listWorkgroups(true);
                                    });
                                  });
                                }}
                                secondary
                              >
                                <span
                                  style={{
                                    textTransform: 'capitalize',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <TranslationText
                                    id="disable"
                                  />
                                </span>
                              </Button>
                        }
                        {
                          this.state.deleteWorkgroup !== null
                          && this.state.deleteWorkgroup.disabled === null
                          && this.state.deleteWorkgroup.boreholes === 0?
                            <Button
                              color='red'
                              onClick={(e)=>{
                                deleteWorkgroup(
                                  this.state.deleteWorkgroup.id
                                ).then(()=>{
                                  this.resetWorkgroup({
                                    "deleteWorkgroup": null
                                  }, () => {
                                    this.props.listWorkgroups(true);
                                  });
                                });
                              }}
                            >
                              <span
                                style={{
                                  textTransform: 'capitalize',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <TranslationText
                                  id="deleteForever"
                                />
                              </span>
                            </Button>: null
                        }
                      </div>
                    </Modal.Actions>
                  </Modal>
                  <Table
                    celled
                    compact
                    selectable
                    size='small'
                  >
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell
                          style={{
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <TranslationText
                            id="workgroup"
                          />
                        </Table.HeaderCell>
                        <Table.HeaderCell
                          style={{
                            textTransform: 'capitalize',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <TranslationText
                            id="boreholes"
                          />
                        </Table.HeaderCell>
                        <Table.HeaderCell
                          style={{
                            textTransform: 'capitalize',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <TranslationText
                            id="roles"
                          />
                        </Table.HeaderCell>
                        <Table.HeaderCell />
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {
                        this.props.workgroups.data.map((workgroup, idx)=>(
                          (
                            this.state.workgroupsSearch !== ''
                            && workgroup.name.toUpperCase().includes(
                              this.state.workgroupsSearch.toUpperCase()
                            )
                          ) || (
                            this.state.workgroupsSearch === ''
                            && (
                              this.state.workgroupFilter === 'all'
                              || (
                                this.state.workgroupFilter === 'disabled'
                                && workgroup.disabled !== null
                              ) || (
                                this.state.workgroupFilter === 'enabled'
                                && workgroup.disabled === null
                              )
                            )
                          )?
                            <Table.Row
                              active={
                                this.state.wId === workgroup.id
                              }
                              key={"stng-workgroups-" + workgroup.id}
                              onClick={()=>{
                                if (this.state.wId === workgroup.id){
                                  this.resetWorkgroup();
                                } else {
                                  this.setState({
                                    "wId": workgroup.id,
                                    "wName": workgroup.name,
                                    "wDisabled": workgroup.disabled,
                                    "workgroup": workgroup
                                  });
                                }
                              }}
                            >
                              <Table.Cell>
                                {
                                  workgroup.disabled !== null?
                                    <Label
                                      circular
                                      color={'red'}
                                      empty
                                      style={{
                                        marginRight: '1em'
                                      }}
                                    />: null
                                }
                                {workgroup.name} {
                                  workgroup.supplier === true?
                                    <span style={{ color: 'red' }}>(supplier)</span>: ''
                                }
                              </Table.Cell>
                              <Table.Cell>
                                {workgroup.boreholes}
                              </Table.Cell>
                              <Table.Cell
                                style={{
                                  paddingTop: '20px'
                                }}
                              >
                                {(()=>{
                                  const uwg = this.state.user.workgroups.find(
                                    w => w.id === workgroup.id
                                  );
                                  return (
                                    <Form>
                                      <Form.Group
                                        autoComplete='off'
                                        widths='equal'
                                      >
                                        <Form.Field>
                                          <Checkbox
                                            checked={
                                              uwg !== undefined
                                              && uwg.roles.indexOf('VIEW') >= 0
                                            }
                                            label='VIEW'
                                            onChange={(e, d) => {
                                              e.stopPropagation();
                                              this.setRole(uwg, workgroup, 'VIEW');
                                            }}
                                          />
                                        </Form.Field>
                                        {
                                          workgroup.supplier === false?
                                            <Form.Field>
                                              <Checkbox
                                                checked={
                                                  uwg !== undefined
                                                  && uwg.roles.indexOf('EDIT') >= 0
                                                }
                                                label='EDITOR'
                                                onChange={(e, d) => {
                                                  e.stopPropagation();
                                                  this.setRole(uwg, workgroup, 'EDIT');
                                                }}
                                              />
                                            </Form.Field>: null
                                        }
                                        {
                                          workgroup.supplier === false?
                                            <Form.Field>
                                              <Checkbox
                                                checked={
                                                  uwg !== undefined
                                                  && uwg.roles.indexOf('CONTROL') >= 0
                                                }
                                                label='CONTROLLER'
                                                onChange={(e, d) => {
                                                  e.stopPropagation();
                                                  this.setRole(uwg, workgroup, 'CONTROL');
                                                }}
                                              />
                                            </Form.Field>: null
                                        }
                                      </Form.Group>
                                      <Form.Group
                                        autoComplete='off'
                                        widths='equal'
                                      >
                                        {
                                          workgroup.supplier === false?
                                            <Form.Field>
                                              <Checkbox
                                                checked={
                                                  uwg !== undefined
                                                  && uwg.roles.indexOf('VALID') >= 0
                                                }
                                                label='VALIDATOR'
                                                onChange={(e, d) => {
                                                  e.stopPropagation();
                                                  this.setRole(uwg, workgroup, 'VALID');
                                                }}
                                              />
                                            </Form.Field>: null
                                        }
                                        <Form.Field>
                                          <Checkbox
                                            checked={
                                              uwg !== undefined
                                              && uwg.roles.indexOf('PUBLIC') >= 0
                                            }
                                            label='PUBLISHER'
                                            onChange={(e, d) => {
                                              e.stopPropagation();
                                              this.setRole(uwg, workgroup, 'PUBLIC');
                                            }}
                                          />
                                        </Form.Field>
                                      </Form.Group>
                                    </Form>
                                  );
                                })()}
                                {
                                  workgroup.disabled !== null?
                                    <span
                                      style={{
                                        color: '#787878',
                                        fontStyle: 'italic',
                                        marginLeft: '0.5em',
                                      }}
                                    >
                                      <TranslationText
                                        id="disabled"
                                      />
                                      &nbsp;
                                      <DateText
                                        date={workgroup.disabled}
                                        fromnow
                                      />&nbsp;(
                                      <DateText
                                        date={workgroup.disabled}
                                        hours
                                      />)
                                    </span>: null
                                }
                              </Table.Cell>
                              <Table.Cell>
                                <span
                                  className='linker link'
                                  onClick={(e)=>{
                                    e.stopPropagation();
                                    this.setState({
                                      deleteWorkgroup: workgroup
                                    });
                                  }}
                                >
                                  {
                                    workgroup.disabled !== null? // isDisabled
                                      <TranslationText
                                        id="enableWorkgroup"
                                      />:
                                      <TranslationText
                                        id="disableWorkgroup"
                                      />
                                  }
                                </span>
                              </Table.Cell>
                            </Table.Row>: null
                        ))
                      }
                    </Table.Body>
                  </Table>
                </div>
              </div>: null
          }
        </div>
        
      </div>
    );
  }
};

AdminSettings.propTypes = {
  developer: PropTypes.object,
  listUsers: PropTypes.func,
  listWorkgroups: PropTypes.func,
  reloadUser: PropTypes.func,
  t: PropTypes.func,
  user: PropTypes.object,
  users: PropTypes.object
};

// AdminSettings.defaultProps = {
// };

const mapStateToProps = (state) => {
  return {
    developer: state.developer,
    user: state.core_user,
    users: state.core_users,
    workgroups: state.core_workgroups
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch: dispatch,
    listUsers: () => {
      dispatch(reloadUser());
      return dispatch(listUsers());
    },
    listWorkgroups: (ru=false) => {
      if (ru === true) {
        dispatch(reloadUser());
      }
      return dispatch(listWorkgroups());
    },
    reloadUser: () => {
      dispatch(reloadUser());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation(['common'])(AdminSettings));
