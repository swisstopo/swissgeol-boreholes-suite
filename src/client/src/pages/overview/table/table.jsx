import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";

import { Pagination, Table } from "semantic-ui-react";

class TTable extends React.Component {
  constructor(props) {
    super(props);
    this.delay = false;
    this.uid = _.uniqueId();
    this.inSelection = this.inSelection.bind(this);
    const { activeItem, filter } = this.props;
    this.state = {
      activeItem: activeItem !== undefined ? activeItem : null,
      filter: filter !== undefined ? filter : {},
      selected: [],
      all: false,
    };
  }

  componentDidMount() {
    const { filter } = this.props;
    // Load first page of data
    this.props.loadData(1, filter, this.props.featureIds);
  }

  componentDidUpdate(prevProps) {
    const { filter, store, scrollPosition } = this.props;
    // Reload data if filters has changed
    if (!_.isEqual(filter, prevProps.filter) || !_.isEqual(this.props.featureIds, prevProps.featureIds)) {
      if (this.delay) {
        clearTimeout(this.delay);
        this.delay = false;
      }
      this.setState(
        {
          selected: [],
          all: false,
        },
        () => {
          this.delay = setTimeout(
            function () {
              this.props.loadData(1, filter, this.props.featureIds);
            }.bind(this),
            10,
          );
        },
      );
    }

    // Reset scroll position after data has been fetched
    if (prevProps.store.isFetching && !store.isFetching) {
      var boreholeTable = document.getElementById("borehole-table");
      var currentScrollPosition = boreholeTable.scrollTop;

      if (scrollPosition && scrollPosition !== currentScrollPosition) {
        boreholeTable.scrollTo(0, scrollPosition);
      }
    }
  }

  /** return true if id has been selected */
  inSelection(id) {
    const { selected, all } = this.state;
    const index = selected.indexOf(id);
    if (all === true) {
      return index < 0;
    } else {
      return index >= 0;
    }
  }

  handleClick(selected) {
    const { onSelected } = this.props;
    if (this.state.activeItem === selected.id) {
      if (onSelected !== undefined) {
        onSelected(null);
      }
      this.setState({ activeItem: null });
    } else {
      if (onSelected !== undefined) {
        onSelected(selected);
      }
      this.setState({ activeItem: selected.id });
    }
  }

  handleHover(selected) {
    const { onHover } = this.props;
    if (onHover !== undefined) {
      onHover(selected);
    }
  }

  getHeader() {
    console.error("Please overwrite getHeader method");
  }

  getCols() {
    console.error("Please overwrite getCols method");
  }

  onTableScroll() {
    const { scrollPosition, onScrollChange } = this.props;

    // remember current scroll position
    var currentScrollPosition = document.getElementById("borehole-table").scrollTop;
    if (scrollPosition !== currentScrollPosition) {
      onScrollChange(currentScrollPosition);
    }
  }

  render() {
    const { store, filter, featureIds } = this.props;
    const { activeItem, selected, all } = this.state;
    if (store === undefined) {
      return null;
    }
    const tableData = featureIds?.length > 0 ? store.data.filter(item => featureIds.includes(item.id)) : store.data;
    return (
      <div
        style={{
          flex: "1 1 100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          padding: "0.5em",
        }}>
        <div
          style={{
            textAlign: "center",
          }}>
          <Table basic="very" compact="very" fixed>
            <Table.Header>{this.getHeader()}</Table.Header>
          </Table>
        </div>
        <div
          style={{
            flex: "1 1 0%",
            overflowY: "auto",
          }}
          id="borehole-table"
          onScroll={() => this.onTableScroll()}>
          <Table basic="very" compact="very" fixed selectable>
            <Table.Body>
              {tableData.map((item, idx) => (
                <Table.Row
                  active={activeItem === item.id || this.props.highlight === item.id}
                  key={this.uid + "_" + idx}
                  onClick={() => {
                    if (all === true || selected.length > 0) {
                      this.add2selection(item.id);
                    } else {
                      this.handleClick(item);
                    }
                  }}
                  onMouseEnter={() => this.handleHover(item)}
                  onMouseLeave={() => this.handleHover(null)}
                  style={{
                    cursor: "pointer",
                  }}>
                  {this.getCols(item, idx)}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
        {store.pages > 1 ? (
          <div
            style={{
              textAlign: "center",
              padding: "1em 0px 0px 1em",
            }}>
            <Pagination
              activePage={store.page}
              onPageChange={(ev, data) => {
                this.props.loadData(data.activePage, filter, this.props.featureIds);
              }}
              pointing
              secondary
              totalPages={store.pages}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

TTable.propTypes = {
  activeItem: PropTypes.object,
  filter: PropTypes.object,
  highlight: PropTypes.number,
  loadData: PropTypes.func,
  onHover: PropTypes.func,
  onSelected: PropTypes.func,
  store: PropTypes.shape({
    activePage: PropTypes.number,
    data: PropTypes.array,
    page: PropTypes.number,
    pages: PropTypes.number,
  }),
};

TTable.defaultProps = {
  name: "Stranger",
  setting: {
    orderby: null,
    direction: null,
  },
};

export default TTable;
