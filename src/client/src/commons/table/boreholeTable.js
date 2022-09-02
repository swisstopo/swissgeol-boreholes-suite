import React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import _ from 'lodash';

import TableComponent from './tableComponent';
import DomainText from '../form/domain/domainText';
import DateText from '../form/dateText';
import TranslationText from '../form/translationText';

import { Button, Icon, Segment, Table } from 'semantic-ui-react';

import { loadBoreholes } from '../../api-lib/index';

class BoreholeTable extends TableComponent {
  reorder(orderby) {
    const { filter, loadData, store } = this.props;
    let dir = store.direction === 'DESC' ? 'ASC' : 'DESC';
    loadData(store.page, filter, orderby, dir);
  }
  getIcon(orderby, sub = false) {
    const { store } = this.props;
    let style = {
      cursor: 'pointer',
    };
    if (sub === true) {
      style = {
        ...style,
        color: '#787878',
        fontSize: '0.8em',
      };
    }
    return (
      <div
        onClick={() => {
          this.reorder(orderby);
        }}
        style={style}>
        {store.orderby === orderby ? (
          <Icon name={store.direction === 'DESC' ? 'sort down' : 'sort up'} />
        ) : null}
        <TranslationText id={orderby} />
      </div>
    );
  }
  getHeader() {
    return (
      <Table.Row>
        {/* <Table.HeaderCell
          style={{width: '1.5em'}}
          verticalAlign='top'>
          
        </Table.HeaderCell> */}
        {/* <Table.HeaderCell style={{width: '2em'}}>
          <Checkbox
            // checked={all === true}
            onClick={(e)=>{
              e.stopPropagation();
              // this.setState({
              //   all: !all,
              //   selected: []
              // });
            }}
          />
        </Table.HeaderCell> */}
        <Table.HeaderCell verticalAlign="top">
          {this.getIcon('original_name')}
          {this.getIcon('kind', true)}
        </Table.HeaderCell>
        <Table.HeaderCell verticalAlign="top">
          {this.getIcon('restriction')}
          {this.getIcon('restriction_until', true)}
        </Table.HeaderCell>
        {/*<Table.HeaderCell
          verticalAlign='top'>
          {t('coordinates')}
          <br/>
          <span
            style={{
              color: '#787878',
              fontSize: '0.8em'
            }}>
            {t('srs')}
          </span>
        </Table.HeaderCell>*/}
        <Table.HeaderCell verticalAlign="top">
          {this.getIcon('totaldepth')}
          {this.getIcon('top_bedrock', true)}
        </Table.HeaderCell>
        <Table.HeaderCell verticalAlign="top">
          {this.getIcon('drilling_end_date')}
          {this.getIcon('purpose', true)}
        </Table.HeaderCell>
        <Table.HeaderCell
          style={{ width: '4em' }}
          verticalAlign="top"></Table.HeaderCell>
      </Table.Row>
    );
  }
  getCols(item, idx) {
    let colIdx = 0;
    return [
      <Table.Cell key={this.uid + '_' + idx + '_' + colIdx++}>
        {(() => {
          if (!this.props.domains.data.hasOwnProperty('kind')) {
            return null;
          }

          const kind = this.props.domains.data['kind'].find(function (element) {
            return element.id === item.kind;
          });

          const restriction = this.props.domains.data['restriction'].find(
            function (element) {
              return element.id === item.restriction;
            },
          );

          let color = 'black';
          if (restriction !== undefined) {
            if (restriction.code === 'f') {
              color = 'green';
            } else if (['b', 'g'].indexOf(restriction.code) >= 0) {
              color = 'red';
            }
          }

          if (kind !== undefined) {
            return (
              <img
                alt=""
                src={
                  process.env.PUBLIC_URL +
                  '/img/' +
                  kind.code +
                  '-' +
                  color +
                  '.svg'
                }
                style={{
                  height: '0.6em',
                  marginRight: '0.5em',
                  width: '0.6em',
                }}
              />
            );
          } else {
            return (
              <img
                alt=""
                src={process.env.PUBLIC_URL + '/img/a-' + color + '.svg'}
                style={{
                  height: '0.6em',
                  marginRight: '0.5em',
                  width: '0.6em',
                }}
              />
            );
          }
        })()}{' '}
        {item.original_name}
        <br />
        <span
          style={{
            color: '#787878',
            fontSize: '0.8em',
          }}>
          <DomainText id={item.kind} schema="kind" />
        </span>
      </Table.Cell>,
      <Table.Cell key={this.uid + '_' + idx + '_' + colIdx++}>
        <DomainText id={item.restriction} schema="restriction" />
        <br />
        <span
          style={{
            color: '#787878',
            fontSize: '0.8em',
          }}>
          <DateText date={item.restriction_until} />
        </span>
      </Table.Cell>,
      // <Table.Cell key={this.uid + "_" + idx + "_" + colIdx++}>
      //   {item.location_x}, {item.location_y}
      //   <br/>
      //   <span
      //     style={{
      //       color: '#787878',
      //       fontSize: '0.8em'
      //     }}>
      //     <DomainText id={item.srs} schema='srs'/>
      //   </span>
      // </Table.Cell>,
      <Table.Cell key={this.uid + '_' + idx + '_' + colIdx++}>
        {/* {
          _.isNil(item.extended.top_bedrock) ?
            null :
            item.elevation_z + ' m'
        } {
          _.isNil(item.hrs) ?
            null : <span>(
              <DomainText
                id={item.hrs}
                schema='hrs'
              />)</span>
        } */}
        {_.isNil(item.length) ? 'n/p' : item.length + ' m'}
        <br />
        <span
          style={{
            color: '#787878',
            fontSize: '0.8em',
          }}>
          {
            _.isNil(item.extended.top_bedrock)
              ? ''
              : item.extended.top_bedrock + ' m'
            // _.isNil(item.extended.top_bedrock)?
            //   <span>&nbsp;</span>:
            //   item.extended.top_bedrock
          }
        </span>
      </Table.Cell>,
      <Table.Cell key={this.uid + '_' + idx + '_' + colIdx++}>
        <DateText date={item.drilling_date} />
        <br />
        <span
          style={{
            color: '#787878',
            fontSize: '0.8em',
          }}>
          {_.isNil(item.extended.purpose) ? null : (
            <span>
              (
              <DomainText
                id={item.extended.purpose}
                schema="extended.purpose"
              />
              )
            </span>
          )}
        </span>
      </Table.Cell>,
      <Table.Cell
        key={this.uid + '_' + idx + '_' + colIdx++}
        style={{
          width: '4em',
          textAlign: 'center',
        }}>
        {
          // this.props.home.hover !== null
          // && this.props.home.hover.id === item.id?
          //   <Button
          //     disabled={this.inCart(item.id)}
          //     icon
          //     color='blue'
          //     icon='cart'
          //     onClick={(e)=>{
          //       e.stopPropagation();
          //       this.add2cart(item.id);
          //     }}
          //     size='tiny'
          //   />: null
        }
        <Button
          color={
            _.findIndex(this.props.checkout.cart, ['id', item.id]) >= 0
              ? 'grey'
              : 'black'
          }
          icon={
            _.findIndex(this.props.checkout.cart, ['id', item.id]) >= 0
              ? 'minus'
              : 'plus'
          }
          onClick={e => {
            e.stopPropagation();
            this.props.toggleCart(item);
          }}
          size="mini"
        />
        {/* <Icon
          color='grey'
          name='cart plus'
        /> */}
      </Table.Cell>,
    ];
  }
  render() {
    return (
      <Segment
        basic
        loading={this.props.store.isFetching}
        style={{
          flex: '1 1 100%',
          display: 'flex',
          flexDirection: 'column',
          // height: '100%',
          overflow: 'hidden',
        }}>
        {super.render()}
      </Segment>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    checkout: state.checkout,
    store: state.core_borehole_list,
    domains: state.core_domain_list,
    ...ownProps,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    loadData: (page, filter = {}, orderby = null, direction = null) => {
      dispatch(loadBoreholes(page, 100, filter, orderby, direction));
    },
    toggleCart: item => {
      dispatch({
        type: 'CHECKOUT_TOGGLE_CART',
        item: item,
      });
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation('common')(BoreholeTable));
