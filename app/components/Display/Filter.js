var React = require('react');

var Filter = React.createClass({
  filterClick: function(value, reactEvent) {
      console.log('------filterClick-------',reactEvent);
      reactEvent.preventDefault();
      var filter = value.toLowerCase();
      this.props.onFilterChange(filter);
  },
  componentDidMount: function() {

  },
  render: function() {
    var currFilter = this.props.currFilter
    var items = ['Node', 'Capacitor', 'Solar', 'Generator', 'Load'];
    var rows = items.map(function(item, i) {
      var className = "collection-item";
      if (item.toLowerCase() == currFilter) {
        className += " active";
      }
      return (<a key={i} href="#" onClick={this.filterClick.bind(null, item)} className={className}>{item}</a>)
    }.bind(this));

    return (
      <div ref="mountPoint">
        <h4>Explorator</h4>
        <div className="collection">
          {rows}
        </div>
      </div>
    );
  }
});

module.exports = Filter;