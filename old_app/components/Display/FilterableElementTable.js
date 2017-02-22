var React = require('react');
var ReactDOM = require('react-dom');

var ElementRow = React.createClass({
  rowClick: function(data, reactEvent) {
    // console.log('-----row click-----');
    this.props.singleClick(data);
  },
  render: function() {
    var data = [];
    var element = this.props.element;
    for (var k in element) {
      data.push(<td key={k}>{element[k]}</td>)
    }
    var inlineStyle = {}
    if (this.props.selected) {
        inlineStyle.color = "#f44336";
        inlineStyle.fontWeight = 700;
    }
    return (
      <tr data-tag={element.pgIndex} onClick={this.rowClick.bind(null, element)} style={inlineStyle} className={this.props.selected ? "selected-row" : ""}>
        {data}
      </tr>
    );
  }
});

var ElementTable = React.createClass({
  singleClick: function(data) {
    this.props.singleClick(data);
  },
  getInitialState: function() {
    return {
      sorted: false
    }
  },
  attributeClick: function(attribute) {
    this.setState({
      sorted: attribute
    })
  },
  render: function() {
    var elements = this.props.elements;
    var attributes = [];
    if (elements.length > 0) {
      attributes= Object.keys(elements[0]);
    }

    var rows = [];
    var selected = this.props.selected;
    //its own state
    var sorted = this.state.sorted;
    if (sorted) {
      elements = this.props.elements.sort(function(a, b) {
        return a[sorted] - b[sorted];
      });
    }
    var self = this;
    elements.forEach(function(element) {
      if (element.name === selected) {
        rows.push(
          <ElementRow singleClick={self.singleClick} element={element} key={element.name} selected={true}/>
        )
      } else {
        rows.push(<ElementRow singleClick={self.singleClick} element={element} key={element.name} />);
      }
    });
    return (
      <table id="pgTable" className="highlight bordered">
        <thead>
          <tr>
            {
              attributes.map(function(attribute, i) {
                return (
                  <th style={{cursor: 'pointer'}} onClick={this.attributeClick.bind(null, attribute)} key={i}>
                    {attribute}
                  </th>
                );
              }.bind(this))
            }
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
});

var SearchBar = React.createClass({
  render: function() {
    return (
      <form>
        <input type="text" placeholder="Search..." />
      </form>
    );
  }
});

var FilterableElementTable = React.createClass({
  componentDidUpdate: function() {
    // console.log('FilterableElementTable didUpdate', this.props);
    //at this point, the child element doms should be ready
    if (this.props.selected && this.props.viewMode == "table") {
        var container = $(this.refs.tableView);
        var selectedRow = container.find(".selected-row")[0];
        //to avoid the case when select is not in the current filter table
        if (selectedRow) {
            selectedRow = $(selectedRow);
            container.animate({
                scrollTop: (selectedRow.offset().top - container.offset().top + container.scrollTop())
            }, 800, 'swing');
        }
    }
  },
  render: function() {
    // console.log('FilterableElementTable render');
    //the filter of the table is decide by the selected at this
    var selected = null, filter = null;
    if (this.props.selected) {
        selected = this.props.selected.name;
        filter = this.props.selected.objectType || this.props.selected.object;
        // console.log('we have select props, filter based on select', filter);
    }
    //what if we have filter
    if (this.props.filter) {
        filter = this.props.filter;
        // console.log('we have filter props', filter);
    }

    var filteredElements = [];
    var data = this.props.data;
    for (var key in data) {
        if (data[key].object == filter) {
            filteredElements.push(data[key]);
        }
    }
    var inlineStyle = {
        height: '100%',
        border: '.5px dotted lightgray',
        overflow: 'scroll',
        padding: 5,
        position: 'relative'
    }
    return (
      <div style={inlineStyle} ref='tableView'>
        <SearchBar />
        <h4>{filter ? filter.toUpperCase() : null} </h4>
        <div className="divider"></div>
        <ElementTable elements={filteredElements} selected={selected} singleClick={this.props.onSelectChange}/>
      </div>
    );
  }
});

module.exports = FilterableElementTable;