var React = require('react');
var ForceVis = require('./ForceVis');
var MapVis = require('./MapVis');
var SelectInfo = require('./SelectInfo');

var MapSwitch = React.createClass({
    onSwitchChange: function(event) {
        console.log('checked on Change detected!!!!')
        console.log(event.target.checked);
        this.props.onSwitchChange(event.target.checked);
    },
    render: function() {
        var inlineStyle = {
            position: 'absolute',
            zIndex: 100,
            top: '5px',
            left: '5px'
        }
        return (
        <div style={inlineStyle}>
          <div className="switch">
            <label>
              Map Off
              <input type="checkbox" onChange={this.onSwitchChange} checked={this.props.mapOn}/>
              <span className="lever"></span>
              Map On
            </label>
          </div>
        </div>
        )
    }
})


var VisContainer = React.createClass({
  getInitialState: function() {
    return {
        mapOn: true
    }
  },
  onSwitchChange: function(mapOn) {
    this.setState({
        mapOn: mapOn
    });
  },
  render: function() { 
    var inlineStyle = {
        height: this.props.height,
        border: '.5px dotted lightgray',
        position: 'relative',
    }
    if (this.props.selected) {
        var selectedInfo = this.props.selected;
    }

    return (
        <div style={inlineStyle}> 
            {!this.state.mapOn ?  (<ForceVis data={this.props.data} width={1000} height={600} onSelectChange={this.props.onSelectChange} onFilterChange={this.props.onFilterChange} selected={this.props.selected} filter={this.props.filter} />) :
                (<MapVis zoomLevel={this.props.zoomLevel} onViewChange={this.props.onViewChange} data={this.props.data} width={1000} height={600} onSelectChange={this.props.onSelectChange} onFilterChange={this.props.onFilterChange} selected={this.props.selected} filter={this.props.filter}/>)
            }
            <MapSwitch onSwitchChange={this.onSwitchChange} mapOn={this.state.mapOn}/>   
            {this.props.selected ? <SelectInfo selectedInfo={selectedInfo} /> : null}
        </div>
    );
  }
});

module.exports = VisContainer;

