var React = require('react');
var ReactDOM = require('react-dom');

var ElementRow = React.createClass({
  rowClick: function(data, reactEvent) {
    // console.log('-----row click-----');
    if (this.props.selected) {
      this.props.singleClick(null);
    } else {
      this.props.singleClick(data);
    }
  },
  render: function() {
    var data = [];
    var element = this.props.element;
    var attributes = this.props.attributes;
    attributes.forEach(function(k) {
      data.push(<td key={k}>{element[k]}</td>)
    });
    var inlineStyle = {}
    if (this.props.selected) {
        inlineStyle.color = "#f44336";
        inlineStyle.fontWeight = 700;
    }
    return (
      <tr 
        ref='myRow' 
        data-tag={element.pgIndex} 
        onClick={this.rowClick.bind(null, element)} 
        style={inlineStyle} 
        className={this.props.selected ? "selected-row" : ""}>
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
      sorted: {
        name: null,
        order: 'asc'
      }
    }
  },
  attributeClick: function(attribute) {
    this.setState({
      sorted: {
        name: attribute,
        order: (this.state.sorted.order === 'asc' ? 'desc': 'asc')
      }
    })
  },
  render: function() {
    var elements = this.props.elements;
    var attributes = [];
    var badName = {
      'name': 1,
      'id': 1,
      'object': 1,
      'gldIndex': 1,
      'parent': 1,
    };
    if (elements.length > 0) {
      attributes= Object.keys(elements[0]);
      attributes = attributes.filter(function(name) {
        return !(name in badName)
      });
      attributes.unshift('parent');
      attributes.unshift('gldIndex');
      attributes.unshift('object');
      attributes.unshift('name');
      attributes.unshift('id');
    }

    var rows = [];
    var selected = this.props.selected;
    //its own state
    var sortAttr = this.state.sorted.name;
    if (sortAttr) {
      var asc = (this.state.sorted.order === 'asc');
      elements = this.props.elements.sort(function(a, b) {
        return asc ? (a[sortAttr] - b[sortAttr]) : (b[sortAttr] - a[sortAttr]);
      });
    }
    var self = this;
    elements.forEach(function(element) {
      if (element.name === selected) {
        rows.push(
          <ElementRow
            attributes = {attributes}
            singleClick={self.singleClick} 
            element={element} 
            key={element.name} 
            selected={true}/>
        )
      } else {
        rows.push(<ElementRow 
          attributes = {attributes}
          singleClick={self.singleClick} 
          element={element} 
          key={element.name} />);
      }
    });
    return (
      <table id="pgTable" className="striped bordered hover">
        <thead>
          <tr>
                {
                  attributes.map(function(attribute, i) {
                    return (
                      <th 
                        style={{cursor: 'pointer'}} 
                        onClick={this.attributeClick.bind(null, attribute)} 
                        key={i}>
                        {attribute}&nbsp;&nbsp;
                        <i
                          style={{
                            opacity: (
                              attribute === this.state.sorted.name ? 1 : 0.5
                            )
                          }}
                          className={
                          "fa fa-sort" + 
                          (attribute === this.state.sorted.name ? 
                            ("-" + this.state.sorted.order) : "")
                        }></i>
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


var FilterableElementTable = React.createClass({
  componentDidMount: function() {
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
    }
    var filteredElements = [];
    var data = this.props.data;

    var nodeData = data['nodes'];
    nodeData.forEach(function(d) {
      d.elements.forEach(function(e) {
        if (e.object == filter) {
          filteredElements.push(data[key]);
        }
      })
    });
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
        <div className="divider"></div>
        <ElementTable 
          elements={filteredElements} 
          selected={selected} 
          singleClick={this.props.onSelectChange}
          hoverCb={this.props.hoverCb}
          />
      </div>
    );
  }
});

module.exports = FilterableElementTable;