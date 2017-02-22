var React = require('react');

var Filter = React.createClass({
  filterClick: function(value, reactEvent) {
      // console.log('------filterClick-------',reactEvent);
      reactEvent.preventDefault();
      var filter = value.toLowerCase();
      this.props.onFilterChange(filter);
  },
  componentDidMount: function() {

  },
  render: function() {
    var currFilter = this.props.currFilter
    //arrange them in order of load/generator/storage/solar/capacitor
    var items = ['Node', 'Load', 'Generator', 'Storage', 'Solar', 'Capacitor'];
    var iconClassName = {
      "Load": 'fa fa-arrow-down',
      "Generator": 'fa fa-bolt',
      "Storage": 'fa fa-battery-three-quarters',
      "Solar": 'fa fa-star',
      "Capacitor": 'fa fa-archive',
    }
    var rows = items.map(function(item, i) {
      var className = "collection-item";
      if (item.toLowerCase() == currFilter) {
        className += " active";
      }
      return (<a key={i} href="#" onClick={this.filterClick.bind(null, item)} className={className}>{item}&nbsp;<i className={iconClassName[item]} aria-hidden="true"></i></a>)
    }.bind(this));

    return (
      <div ref="mountPoint">
        <div className="collection">
          {rows}
        </div>
      </div>
    );
  }
});

module.exports = Filter;